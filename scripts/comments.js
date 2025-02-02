document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');

    if (!postId) {
        document.getElementById('comments-container').innerHTML = '<div>Post not found.</div>';
        return;
    }

    function getPostReactions(postId) {
        const reactions = JSON.parse(localStorage.getItem('postReactions') || '{}');
        if (!reactions[postId]) {
            reactions[postId] = {
                likes: 0,
                dislikes: 0,
                userReactions: null,
                comments: []
            };
        }
        return reactions;
    }

    function savePostReactions(postId, reactions) {
        const allReactions = JSON.parse(localStorage.getItem('postReactions') || '{}');
        allReactions[postId] = reactions;
        localStorage.setItem('postReactions', JSON.stringify(allReactions));
    }

    try {
        const postResponse = await fetch(`https://dummyjson.com/posts/${postId}`);
        const postData = await postResponse.json();
        document.getElementById('post-title').textContent = postData.title || `Post #${postId}`;
        document.getElementById('post-content').textContent = postData.body;
        document.getElementById('post-tags').textContent = `Tags: ${(postData.tags || []).join(', ')}`;

        const commentsResponse = await fetch(`https://dummyjson.com/comments/post/${postId}`);
        const commentsData = await commentsResponse.json();
        const apiComments = commentsData.comments || [];

        const usersResponse = await fetch('https://dummyjson.com/users');
        const usersData = await usersResponse.json();
        const users = usersData.users || [];

        const userSelect = document.getElementById('comment-user');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.firstName} ${user.lastName}`;
            userSelect.appendChild(option);
        });

        const reactions = getPostReactions(postId);
        let { likes, dislikes, comments: localComments } = reactions[postId];

        if (!reactions[postId].likes && !reactions[postId].dislikes) {
            likes = postData.reactions?.likes || 0;
            dislikes = postData.reactions?.dislikes || 0;
            reactions[postId].likes = likes;
            reactions[postId].dislikes = dislikes;
            savePostReactions(postId, reactions[postId]);
        }

        const allComments = [...apiComments, ...localComments];

        const commentsList = document.getElementById('comments-list');
        allComments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.classList.add('comment');
            commentItem.innerHTML = `
                <div class="comment-user">${comment.user ? comment.user.fullName : 'Anonymous'}</div>
                <div class="comment-body">${comment.body}</div>
            `;
            commentsList.appendChild(commentItem);
        });

        document.getElementById('likes-count').textContent = likes;
        document.getElementById('dislikes-count').textContent = dislikes;

        const likeBtn = document.getElementById('like-btn');
        const dislikeBtn = document.getElementById('dislike-btn');
        let hasLiked = false;
        let hasDisliked = false;

        likeBtn.addEventListener('click', () => {
            if (!hasLiked) {
                likes++;
                hasLiked = true;
                likeBtn.classList.add('active');
                if (hasDisliked) {
                    dislikes--;
                    hasDisliked = false;
                    dislikeBtn.classList.remove('active');
                }
            } else {
                likes--;
                hasLiked = false;
                likeBtn.classList.remove('active');
            }
            document.getElementById('likes-count').textContent = likes;
            document.getElementById('dislikes-count').textContent = dislikes;
            reactions[postId].likes = likes;
            reactions[postId].dislikes = dislikes;
            savePostReactions(postId, reactions[postId]);
        });

        dislikeBtn.addEventListener('click', () => {
            if (!hasDisliked) {
                dislikes++;
                hasDisliked = true;
                dislikeBtn.classList.add('active');
                if (hasLiked) {
                    likes--;
                    hasLiked = false;
                    likeBtn.classList.remove('active');
                }
            } else {
                dislikes--;
                hasDisliked = false;
                dislikeBtn.classList.remove('active');
            }
            document.getElementById('likes-count').textContent = likes;
            document.getElementById('dislikes-count').textContent = dislikes;
            reactions[postId].likes = likes;
            reactions[postId].dislikes = dislikes;
            savePostReactions(postId, reactions[postId]);
        });

        const submitCommentBtn = document.getElementById('submit-comment');
        submitCommentBtn.addEventListener('click', () => {
            const userId = document.getElementById('comment-user').value;
            const commentBody = document.getElementById('new-comment').value.trim();

            if (!userId || !commentBody) {
                alert('Please select a user and enter a comment.');
                return;
            }

            const selectedUser = users.find(user => user.id == userId);
            const newComment = {
                user: {
                    username: `${selectedUser.firstName} ${selectedUser.lastName}`
                },
                body: commentBody
            };

            reactions[postId].comments.push(newComment);
            savePostReactions(postId, reactions[postId]);

            const commentItem = document.createElement('li');
            commentItem.classList.add('comment');
            commentItem.innerHTML = `
                <div class="comment-user">${newComment.user.username}</div>
                <div class="comment-body">${newComment.body}</div>
            `;
            commentsList.appendChild(commentItem);

            document.getElementById('comment-user').selectedIndex = 0;
            document.getElementById('new-comment').value = '';
        });

    } catch (error) {
        document.getElementById('comments-container').innerHTML = `<div>Error loading comments: ${error.message}</div>`;
    }
});