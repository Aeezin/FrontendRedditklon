document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');

    if (!postId) {
        document.getElementById('comments-container').innerHTML = '<div>Post not found.</div>';
        return;
    }

    // Load stored posts from localStorage
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let postData = posts.find(post => post.id == postId);

    function getPostReactions(postId) {
        const reactions = JSON.parse(localStorage.getItem('postReactions') || '{}');
        if (!reactions[postId]) {
            reactions[postId] = {
                likes: 0,
                dislikes: 0,
                userReaction: null,
                comments: []
            };
            localStorage.setItem('postReactions', JSON.stringify(reactions));
        }
        return reactions[postId];
    }

    function savePostReactions(postId, postReactions) {
        const allReactions = JSON.parse(localStorage.getItem('postReactions') || '{}');
        allReactions[postId] = postReactions;
        localStorage.setItem('postReactions', JSON.stringify(allReactions));
    }

    try {
        // Display post data
        document.getElementById('post-title').textContent = postData.title || `Post #${postId}`;
        document.getElementById('post-content').textContent = postData.body;
        document.getElementById('post-tags').textContent = `Tags: ${(postData.tags || []).join(', ')}`;

        // Initialize reactions
        const postReactions = getPostReactions(postId);

        // Only initialize from API if no local reactions exist
        if (postReactions.likes === 0 && postReactions.dislikes === 0) {
            if (postData.reactions && typeof postData.reactions === 'object') {
                postReactions.likes = postData.reactions.likes || 0;
                postReactions.dislikes = postData.reactions.dislikes || 0;
            }
            // For new user-created posts, keep at 0
            savePostReactions(postId, postReactions);
        }

        // Fetch comments from API only if needed
        let apiComments = [];
        try {
            const commentsResponse = await fetch(`https://dummyjson.com/comments/post/${postId}`);
            if (commentsResponse.ok) {
                const commentsData = await commentsResponse.json();
                apiComments = commentsData.comments || [];
            }
        } catch (error) {
            console.warn('Failed to fetch comments from API:', error);
        }

        // Fetch users for comment dropdown
        let users = [];
        try {
            const usersResponse = await fetch('https://dummyjson.com/users?limit=0&select=firstName,lastName');
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                users = usersData.users || [];

                // Store users in localStorage for preserving comment user info
                localStorage.setItem('users', JSON.stringify(users));

                // Populate user dropdown
                const userSelect = document.getElementById('comment-user');
                userSelect.innerHTML = '<option value="">Select a user...</option>';
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.firstName} ${user.lastName}`;
                    userSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.warn('Failed to fetch users from API:', error);
            // Try to load users from localStorage if API fails
            const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
            users = storedUsers;
        }

        // Display all comments
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';

        // Function to get user info from localStorage
        function getUserInfo(userId) {
            const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
            return storedUsers.find(user => user.id == userId);
        }

        // Display API comments
        apiComments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.classList.add('comment');
            commentItem.innerHTML = `
            <div class="comment-user">${comment.user?.fullName || 'Anonymous'}</div>
            <div class="comment-body">${comment.body}</div>
            `;
            commentsList.appendChild(commentItem);
        });

        // Display local comments with proper user info
        postReactions.comments.forEach(comment => {
            const user = getUserInfo(comment.userId);
            const commentItem = document.createElement('li');
            commentItem.classList.add('comment');
            commentItem.innerHTML = `
            <div class="comment-user">${user ? `${user.firstName} ${user.lastName}` : comment.user?.username || 'Anonymous'}</div>
            <div class="comment-body">${comment.body}</div>
            `;
            // fixa comment-user ^
            commentsList.appendChild(commentItem);
        });

        // Update reaction counts
        document.getElementById('likes-count').textContent = postReactions.likes;
        document.getElementById('dislikes-count').textContent = postReactions.dislikes;

        // Handle reactions
        const likeBtn = document.getElementById('like-btn');
        const dislikeBtn = document.getElementById('dislike-btn');

        // Set initial button states
        if (postReactions.userReaction === 'like') {
            likeBtn.classList.add('active');
        } else if (postReactions.userReaction === 'dislike') {
            dislikeBtn.classList.add('active');
        }

        likeBtn.addEventListener('click', () => {
            const isLiked = postReactions.userReaction === 'like';
            if (!isLiked) {
                postReactions.likes++;
                if (postReactions.userReaction === 'dislike') {
                    postReactions.dislikes--;
                    dislikeBtn.classList.remove('active');
                }
                postReactions.userReaction = 'like';
                likeBtn.classList.add('active');
            } else {
                postReactions.likes--;
                postReactions.userReaction = null;
                likeBtn.classList.remove('active');
            }
            document.getElementById('likes-count').textContent = postReactions.likes;
            document.getElementById('dislikes-count').textContent = postReactions.dislikes;
            savePostReactions(postId, postReactions);
        });

        dislikeBtn.addEventListener('click', () => {
            const isDisliked = postReactions.userReaction === 'dislike';
            if (!isDisliked) {
                postReactions.dislikes++;
                if (postReactions.userReaction === 'like') {
                    postReactions.likes--;
                    likeBtn.classList.remove('active');
                }
                postReactions.userReaction = 'dislike';
                dislikeBtn.classList.add('active');
            } else {
                postReactions.dislikes--;
                postReactions.userReaction = null;
                dislikeBtn.classList.remove('active');
            }
            document.getElementById('likes-count').textContent = postReactions.likes;
            document.getElementById('dislikes-count').textContent = postReactions.dislikes;
            savePostReactions(postId, postReactions);
        });

        // Handle new comments
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
                userId: userId, // Store the userId for persistence
                user: {
                    username: `${selectedUser.firstName} ${selectedUser.lastName}`
                },
                body: commentBody
            };

            postReactions.comments.push(newComment);
            savePostReactions(postId, postReactions);

            const commentItem = document.createElement('li');
            commentItem.classList.add('comment');
            commentItem.innerHTML = `
            <div class="comment-user">${selectedUser.firstName} ${selectedUser.lastName}</div>
            <div class="comment-body">${commentBody}</div>
            `;
            commentsList.appendChild(commentItem);

            document.getElementById('comment-user').selectedIndex = 0;
            document.getElementById('new-comment').value = '';
        });

    } catch (error) {
        document.getElementById('comments-container').innerHTML = `<div>Error loading post: ${error.message}</div>`;
    }
});