"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const coinCol = db.collection('coins');
const orgCol = db.collection('github').doc('organisations');
const repoCol = db.collection('github').doc('repos');
const userCol = db.collection('github').doc('users');
const github = require('octonode');
const GIT_ID = '1381d44f20246cbdba19';
const GIT_SECRET = 'a6d3cc5bed57502e606ce12fec4aebaf2b73e9f4';
const githubClient = github.client({
    id: GIT_ID,
    secret: GIT_SECRET
});
exports.coinAdded = functions.firestore
    .document('coins/{coinId}')
    .onCreate(event => {
    const coin = event.data.data();
    coinCol.doc(coin.id).set({ status: {
            isOrgSyncing: true,
            startedReposSyncing: false,
            createdAt: new Date()
        } }, { merge: true });
    const ghorg = githubClient.org(coin.githubName).conditional('ETAG');
    ghorg.info((err, data, headers) => {
        createOrUpdateOrganisation(coin.id, coin.githubName, data)
            .then(() => {
            coinCol.doc(coin.id).set({ status: {
                    orgSynced: true,
                    isOrgSyncing: false,
                    updatedAt: new Date()
                } }, { merge: true });
        })
            .catch((e) => {
            console.log('Error syncing coin');
            coinCol.doc(coin.id).set({ status: {
                    orgSynced: false,
                    isOrgSyncing: false,
                    errorOrgSync: true,
                    updatedAt: new Date()
                } }, { merge: true });
        });
    });
});
exports.organisationAdded = functions.firestore
    .document('github/organisations/{orgId}/information')
    .onCreate(event => {
    const org = event.data.data();
    coinCol.doc(org.coinId).set({ status: {
            startedReposSyncing: true,
            isReposSyncing: true,
            isMembersSyncing: true,
            updatedAt: new Date()
        } }, { merge: true })
        .then(() => {
        fetchOrganisationRepos(org.coinId, org.ghLogin, 1);
        fetchOrganisationMembers(org.coinId, org.ghLogin, 1);
    }).catch((e) => {
        console.log('Error syncing org repos or members', e);
        coinCol.doc(org.coinId).set({ status: {
                reposSynced: false,
                isReposSyncing: false,
                membersSynced: false,
                isMembersSyncing: false,
                errorOrgSync: true,
                updatedAt: new Date()
            } }, { merge: true });
    });
});
exports.repoAdded = functions.firestore
    .document('github/repos/{orgId}/{repoId}')
    .onCreate(event => {
    const repo = event.data.data();
    getCoin(event.params.orgId).then((coin) => {
        console.log(coin.data().id + ' - ' + coin.data().githubName + ' - ' + repo.name);
        fetchRepositoryReleases(coin.data().id, coin.data().githubName, repo.name);
        fetchRepositoryLanguages(coin.data().id, coin.data().githubName, repo.name);
        fetchRepositoryContributors(coin.data().id, coin.data().githubName, repo.name);
    });
});
function fetchOrganisationRepos(coinId, orgId, page) {
    const ghorg = githubClient.org(orgId).conditional('ETAG');
    return ghorg.repos({
        page: page,
        per_page: 100
    }, (err, data, headers) => {
        if (!err && headers.status === '200 OK') {
            data.forEach((repo) => {
                createOrUpdateRepo(coinId, orgId, repo);
            });
            if (data.length === 100) {
                return fetchOrganisationRepos(coinId, orgId, page + 1);
            }
            else {
                return coinCol.doc(coinId).set({ status: {
                        reposSynced: true,
                        isReposSyncing: false,
                        updatedAt: new Date()
                    } }, { merge: true });
            }
        }
        else {
            console.log('Error fetchOrganisationRepos', err);
            return coinCol.doc(coinId).set({ status: {
                    reposSynced: false,
                    isReposSyncing: false,
                    errorReposSync: true,
                    updatedAt: new Date()
                } }, { merge: true });
        }
    });
}
function fetchOrganisationMembers(coinId, orgId, page) {
    const ghorg = githubClient.org(orgId).conditional('ETAG');
    return ghorg.members({
        page: page,
        per_page: 100
    }, (err, data, headers) => {
        if (!err && headers.status == '200 OK') {
            data.forEach((member) => {
                if (member) {
                    fetchGithubUserInfo(member.login);
                    createOrUpdateOrgMember(coinId, orgId, member);
                }
            });
            if (data.length == 100) {
                fetchOrganisationMembers(coinId, orgId, page + 1);
            }
            else {
                return coinCol.doc(coinId).set({ status: {
                        membersSynced: true,
                        isMembersSyncing: false,
                        updatedAt: new Date()
                    } }, { merge: true });
            }
        }
        else {
            console.log('Error fetchOrganisationMembers', err);
            return coinCol.doc(coinId).set({ status: {
                    membersSynced: false,
                    isMembersSyncing: false,
                    errorMembersSync: true,
                    updatedAt: new Date()
                } }, { merge: true });
        }
    });
}
function fetchGithubUserInfo(userLogin) {
    const ghuser = githubClient.user(userLogin).conditional('ETAG');
    return ghuser.info((err, data, headers) => {
        if (!err && headers.status == '200 OK') {
            return createOrUpdateGitUser(data);
        }
        else {
            console.log('Error fetchGithubUserInfo', err);
        }
    });
}
function fetchRepositoryReleases(coinId, orgId, repoId) {
    return githubClient.repo(orgId + '/' + repoId).conditional('ETAG').releases((err, data, headers) => {
        if (!err && headers.status == '200 OK') {
            data.forEach((release) => {
                createOrUpdateRepoRelease(coinId, repoId, release);
            });
        }
        else {
            console.log('Error fetchRepositoryReleases', err);
            console.log(headers);
        }
    });
}
function fetchRepositoryLanguages(coinId, orgId, repoId) {
    return githubClient.repo(orgId + '/' + repoId).conditional('ETAG').languages((err, data, headers) => {
        if (!err && headers.status == '200 OK') {
            createOrUpdateRepoLanguages(coinId, repoId, data);
        }
        else {
            console.log('Error fetchRepositoryLanguages', err);
            console.log(headers);
        }
    });
}
function fetchRepositoryContributors(coinId, orgId, repoId) {
    return githubClient.repo(orgId + '/' + repoId).conditional('ETAG').contributors((err, data, headers) => {
        if (!err && headers.status == '200 OK') {
            data.forEach((contributor) => {
                createOrUpdateRepoContributor(coinId, repoId, contributor);
            });
        }
        else {
            console.log('Error fetchRepositoryContributors', err);
        }
    });
}
function createOrUpdateOrganisation(coinId, organisationId, data) {
    const org = {
        coinId: coinId,
        orgId: organisationId,
        ghId: data.id,
        ghLogin: data.login,
        ghUrl: data.url,
        ghHasOrProjects: data.has_organization_projects,
        ghHasRepoProjects: data.has_repository_projects,
        ghReposCount: data.public_repos,
        ghHtml: data.html_url,
        ghCreatedAt: data.created_at,
        ghUpdatedAt: data.updated_at,
        ghType: data.type
    };
    addFieldDataIfValid(org, 'ghAvatar', data.avatar_url);
    addFieldDataIfValid(org, 'ghDescription', data.description);
    addFieldDataIfValid(org, 'ghName', data.name);
    addFieldDataIfValid(org, 'ghCompany', data.company);
    addFieldDataIfValid(org, 'ghBlog', data.blog);
    return orgCol.collection(coinId).doc('information').set(org);
}
function createOrUpdateRepo(coinId, organisationId, data) {
    const repo = {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        isPrivate: data.private,
        htmlUrl: data.html_url,
        url: data.url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        size: data.size,
        watchers: data.watchers_count,
        stars: data.stargazers_count,
        hasIssues: data.has_issues,
        hasProjects: data.has_projects,
        hasDownloads: data.has_downloads,
        hasWiki: data.has_wiki,
        hasPages: data.has_pages,
        forksCount: data.forks_count,
        archived: data.archived,
        openIssues: data.open_issues,
        permissions: data.permissions
    };
    addFieldDataIfValid(repo, 'homepage', data.homepage);
    return repoCol.collection(coinId).doc(repo.name).set(repo);
}
function createOrUpdateOrgMember(coinId, organisationId, data) {
    const member = {
        id: data.id,
        login: data.login,
        avatar: data.avatar_url
    };
    return orgCol.collection(coinId).doc('members').collection('list').doc(member.id.toString()).set(member);
}
function createOrUpdateGitUser(data) {
    const user = {
        id: data.id,
        login: data.login,
        avatar: data.avatar_url,
        reposCount: data.public_repos,
        gistsCount: data.public_gists,
        followers: data.followers,
        following: data.following,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
    addFieldDataIfValid(user, 'name', data.name);
    addFieldDataIfValid(user, 'company', data.company);
    addFieldDataIfValid(user, 'blog', data.blog);
    addFieldDataIfValid(user, 'location', data.location);
    addFieldDataIfValid(user, 'email', data.email);
    addFieldDataIfValid(user, 'hireable', data.hireable);
    addFieldDataIfValid(user, 'bio', data.bio);
    return userCol.collection('list').doc(data.id.toString()).set(user);
}
function createOrUpdateRepoRelease(coinId, repoId, data) {
    console.log('createOrUpdateRepoRelease');
    var release = {
        id: data.id,
        name: data.name,
        tagName: data.tag_name,
        isDraft: data.draft,
        isPrerelease: data.prerelease,
        createdAt: data.created_at,
        publishedAt: data.published_at,
        targetComitish: data.target_commitish,
        author: data.author ? data.author.id : 'none',
        body: data.body,
        assets: []
    };
    if (data.assets.length > 0) {
        release.assets = [];
        data.assets.forEach((asset) => {
            release.assets.push(asset);
        });
    }
    return repoCol.collection(coinId).doc(repoId).collection('releases').doc(release.id.toString()).set(release);
}
function createOrUpdateRepoLanguages(coinId, repoId, data) {
    console.log('createOrUpdateRepoLanguages');
    var mainLang = '';
    var mainLangSize = 0;
    Object.keys(data).forEach((lang) => {
        if (data[lang] > mainLangSize) {
            mainLang = lang;
            mainLangSize = data[lang];
        }
        repoCol.collection(coinId).doc(repoId).collection('languages').doc(lang).set({ size: data[lang] });
    });
    return repoCol.collection(coinId).doc(repoId).update({ language: mainLang });
}
function createOrUpdateRepoContributor(coinI, repoId, data) {
    console.log('createOrUpdateRepoContributor');
    gitUserExists(data.id.toString()).then((userExist) => {
        if (!userExist) {
            fetchGithubUserInfo(data.login);
            //do something else
            //add the member to repo contributors
        }
    });
}
function addFieldDataIfValid(obj, key, value) {
    if (value && value !== '') {
        obj[key] = value;
    }
}
function gitUserExists(userId) {
    return userCol.collection('list').doc(userId).get().then((snapshot) => {
        if (snapshot.exists) {
            return true;
        }
        else {
            return false;
        }
    });
}
function getCoin(coinId) {
    return coinCol.doc(coinId).get();
}
//# sourceMappingURL=index.js.map