function printPosts() {
    const postsContainer = document.getElementById('posts-container');

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // console.log('Loading posts from localStorage:', localStorage.getItem('posts')); // Debugging

    if (!Array.isArray(posts) || posts.length === 0) {
        postsContainer.innerHTML = '<div>No posts found.</div>';
        return;
    }

    postsContainer.innerHTML = '';

    posts.forEach(post => {

        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const user = users.find(user => user.id === post.id || user.id === post.userId);

        const username = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        const tags = post.tags && post.tags.length > 0 ? post.tags.join(', ') : '';

        const slicedTitle = post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title;
        const slicedBody = post.body.length > 60 ? post.body.substring(0, 60) + '...' : post.body;

        postElement.innerHTML = `
            <h2>${slicedTitle}</h2>
            <div class="post-body">${slicedBody}</div>
            ${tags ? `<small>Tags: ${tags}</small>` : ''}
            <small>User: ${username}</small>
            <button class="read-more-btn">Read More</button>
        `;

        postElement.querySelector('.read-more-btn').addEventListener('click', () => {
            window.location.href = `comments.html?postId=${post.id}`;
        });

        postsContainer.appendChild(postElement);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchData();
    printPosts();
});
