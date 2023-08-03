module.exports = {
    // Base
    apiBaseURL: 'http://localhost:4000',

    // Users
    apiUsers: '/user',
    apiUsersFriends: '/user/friends',
    apiUsersFriendshipInvitations: '/user/friendshipinvitations',
    apiUsersById: '/user/',
    apiUsersUpdate: '/user/update',
    apiUsersAddFriend: '/user/addfriend/',
    apiUsersAcceptFriend: '/user/acceptfriend/',
    apiUsersRejectFriend: 'user/rejectfriend/',
    apiUsersRemoveFriend: '/user/removefriend/',
    
    // Posts
    apiPosts: '/post',
    apiPostsByUserId: '/post/user/',
    apiPostsById: '/post/',
    apiPostsCreate: '/post/create',
    apiPostsUpdate: '/post/update/',
    apiPostsDelete: '/post/delete/',
    apiPostsLike: '/post/like/',
    apiPostsMostRead: '/post/mostread',

    // Comments
    apiCommentsByPostId: '/comment/',
    apiCommentsCreate: '/comment/create/',
    apiCommentsUpdate: '/comment/update/',
    apiCommentsDelete: '/comment/delete/',
    apiCommentsLike: '/comment/like/',

    // Auth
    apiAuthRegister: '/auth/register',
    apiAuthLogin: '/auth/login',
    apiAuthLogout: '/auth/logout',
    apiAuthRefresh: '/auth/refresh',    
}