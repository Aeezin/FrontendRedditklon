document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');

    if (!postId) {
        document.getElementById('comments-container').innerHTML = '<div>Post not found.</div>';
        return;
    }

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let postData = posts.find(post => post.id == postId);

    if (!postData) {
        document.getElementById('comments-container').innerHTML = '<div>Post not found.</div>';
        return;
    }

    if (!postData.reactions) {
        postData.reactions = { likes: 0, dislikes: 0, userReaction: null };
    }

    if (!postData.comments) {
        postData.comments = [];
    }

    function savePosts(updatedPost) {
        let postIndex = posts.findIndex(post => post.id == updatedPost.id);
        if (postIndex !== -1) {
            posts[postIndex] = updatedPost;
            localStorage.setItem('posts', JSON.stringify(posts));
        } else {
            console.error('Could not find post to update');
        }
    }

    document.getElementById('post-title').textContent = postData.title;
    document.getElementById('post-content').textContent = postData.body;
    document.getElementById('post-tags').textContent = `Tags: ${(postData.tags || []).join(', ')}`;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userSelect = document.getElementById('comment-user');
    userSelect.innerHTML = '<option value="">Select a user</option>';

    users.forEach(user => {
        let option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName}`;
        userSelect.appendChild(option);
    });

    let allComments = JSON.parse(localStorage.getItem('comments')) || [];
    let postComments = allComments.filter(comment => comment.postId == postId);

    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';

    [...postComments, ...postData.comments].forEach(comment => {
        const user = users.find(user => user.id == comment.user.id);
        const commentItem = document.createElement('li');
        commentItem.classList.add('comment');
        commentItem.innerHTML = `
                <div class="comment-user">${user ? `${user.firstName} ${user.lastName}` : 'Anonymous'}</div>
                <div class="comment-body">${comment.body}</div>
            `;
        commentsList.appendChild(commentItem);
    });

    document.getElementById('likes-count').textContent = postData.reactions.likes;
    document.getElementById('dislikes-count').textContent = postData.reactions.dislikes;

    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');

    if (postData.reactions.userReaction === 'like') likeBtn.classList.add('active');
    if (postData.reactions.userReaction === 'dislike') dislikeBtn.classList.add('active');

    likeBtn.addEventListener('click', () => {
        if (postData.reactions.userReaction !== 'like') {
            postData.reactions.likes++;
            if (postData.reactions.userReaction === 'dislike') {
                postData.reactions.dislikes--;
                dislikeBtn.classList.remove('active');
            }
            postData.reactions.userReaction = 'like';
            likeBtn.classList.add('active');
        } else {
            postData.reactions.likes--;
            postData.reactions.userReaction = null;
            likeBtn.classList.remove('active');
        }
        document.getElementById('likes-count').textContent = postData.reactions.likes;
        document.getElementById('dislikes-count').textContent = postData.reactions.dislikes;
        savePosts(postData);
    });

    dislikeBtn.addEventListener('click', () => {
        if (postData.reactions.userReaction !== 'dislike') {
            postData.reactions.dislikes++;
            if (postData.reactions.userReaction === 'like') {
                postData.reactions.likes--;
                likeBtn.classList.remove('active');
            }
            postData.reactions.userReaction = 'dislike';
            dislikeBtn.classList.add('active');
        } else {
            postData.reactions.dislikes--;
            postData.reactions.userReaction = null;
            dislikeBtn.classList.remove('active');
        }
        document.getElementById('likes-count').textContent = postData.reactions.likes;
        document.getElementById('dislikes-count').textContent = postData.reactions.dislikes;
        savePosts(postData);
    });

    document.getElementById('submit-comment').addEventListener('click', () => {
        const userId = userSelect.value;
        const commentBody = document.getElementById('new-comment').value.trim();

        if (!userId || !commentBody) {
            alert('Please select a user and enter a comment.');
            return;
        }

        const commentLenght = JSON.parse(localStorage.getItem('comments')) || [];
        const selectedUser = users.find(user => user.id == userId);
        const newComment = {
            id: commentLenght.length + 1,
            body: commentBody,
            postId,
            user: { id: selectedUser.id, username: selectedUser.username, fullName: selectedUser.firstName + ' ' + selectedUser.lastName },
        };

        postData.comments.push(newComment);
        savePosts(postData);

        let allComments = JSON.parse(localStorage.getItem('comments')) || [];
        allComments.push(newComment);
        localStorage.setItem('comments', JSON.stringify(allComments));

        const commentItem = document.createElement('li');
        commentItem.classList.add('comment');
        commentItem.innerHTML = `
            <div class="comment-user">${selectedUser.firstName} ${selectedUser.lastName}</div>
            <div class="comment-body">${commentBody}</div>
        `;
        commentsList.appendChild(commentItem);

        userSelect.selectedIndex = 0;
        document.getElementById('new-comment').value = '';
    });
});
