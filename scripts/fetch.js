const API_BASE = 'https://dummyjson.com';
const POSTS_KEY = 'posts';
const USERS_KEY = 'users';
const COMMENTS_KEY = 'comments';

async function fetchData() {
    try {
        let posts = JSON.parse(localStorage.getItem(POSTS_KEY));
        if (!posts) {
            const response = await fetch(`${API_BASE}/posts?limit=0&select=id,title,body,reactions,tags,userId`);
            const data = await response.json();
            posts = data.posts;
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        }

        let users = JSON.parse(localStorage.getItem(USERS_KEY));
        if (!users) {
            const response = await fetch(`${API_BASE}/users?limit=0&select=id,firstName,lastName,username`);
            const data = await response.json();
            users = data.users;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));
        if (!comments) {
            const response = await fetch(`${API_BASE}/comments?limit=0&select=id,body,postId,user`);
            const data = await response.json();
            comments = data.comments;
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
fetchData();