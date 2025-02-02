const API_BASE = 'https://dummyjson.com';
const POSTS_KEY = 'posts';
const USERS_KEY = 'users';
const COMMENTS_KEY = 'comments';

async function fetchData() {
    try {
        let posts = JSON.parse(localStorage.getItem(POSTS_KEY));
        if (!posts) {
            const response = await fetch(`${API_BASE}/posts`);
            const data = await response.json();
            posts = data.posts;
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        }

        let users = JSON.parse(localStorage.getItem(USERS_KEY));
        if (!users) {
            const response = await fetch(`${API_BASE}/users`);
            const data = await response.json();
            users = data.users;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));
        if (!comments) {
            const response = await fetch(`${API_BASE}/comments`);
            const data = await response.json();
            comments = data.comments;
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
fetchData();


async function fetchPosts() {
    try {
        let posts = JSON.parse(localStorage.getItem(POSTS_KEY));

        if (!Array.isArray(posts) || posts.length === 0) {
            const response = await fetch(`${API_BASE}/posts`);
            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();
            localStorage.setItem(POSTS_KEY, JSON.stringify(data.posts));
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function fetchUsers() {
    try {
        let users = JSON.parse(localStorage.getItem(USERS_KEY));

        if (!Array.isArray(users) || users.length === 0) {
            const response = await fetch(`${API_BASE}/users`);
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function fetchComments() {
    try {
        let comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));

        if (!Array.isArray(comments) || comments.length === 0) {
            const response = await fetch(`${API_BASE}/comments`);
            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            localStorage.setItem(COMMENTS_KEY, JSON.stringify(data.comments));
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}
fetchData();