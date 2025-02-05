document.addEventListener('DOMContentLoaded', async () => {
    const postForm = document.getElementById('new-post-form');
    const titleInput = document.getElementById('post-title');
    const bodyInput = document.getElementById('post-body');
    const userSelect = document.getElementById('post-users');
    const tagsSelect = document.getElementById('post-tags');
    const addTagBtn = document.getElementById('add-tag-btn');
    const selectedTagsContainer = document.getElementById('selected-tags');
    const previewTitle = document.getElementById('preview-title');
    const previewBody = document.getElementById('preview-body');
    const previewUser = document.getElementById('preview-user');
    const previewTags = document.getElementById('preview-tags');

    let selectedTags = [];

    async function fetchUsers() {
        try {
            let users = JSON.parse(localStorage.getItem('users'));

            userSelect.innerHTML = '<option value="">Select a user</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.firstName} ${user.lastName}`;
                userSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users. Please try again later.');
        }
    }

    await fetchUsers();

    function updatePreview() {
        previewTitle.textContent = titleInput.value.trim() || 'Your title will appear here';
        previewBody.textContent = bodyInput.value.trim() || 'Your content will appear here';

        const selectedOption = userSelect.options[userSelect.selectedIndex];
        previewUser.textContent = selectedOption?.textContent || '- User';

        previewTags.textContent = selectedTags.join(', ') || '- Tags';
    }

    titleInput.addEventListener('input', updatePreview);
    bodyInput.addEventListener('input', updatePreview);
    userSelect.addEventListener('change', updatePreview);

    addTagBtn.addEventListener('click', () => {
        const selectedTag = tagsSelect.value;

        if (!selectedTag) {
            alert('Please select a tag.');
            return;
        }

        if (selectedTags.length >= 3) {
            alert('You can only add up to 3 tags.');
            return;
        }

        selectedTags.push(selectedTag);

        const selectedOption = tagsSelect.querySelector(`option[value="${selectedTag}"]`);
        if (selectedOption) {
            selectedOption.remove();
        }

        renderSelectedTags();
        updatePreview();

        if (selectedTags.length >= 3) {
            addTagBtn.disabled = true;
        }
    });

    function renderSelectedTags() {
        selectedTagsContainer.innerHTML = selectedTags
            .map(tag => `
                <span class="tag">
                    ${tag}
                    <button class="remove-tag-btn" data-tag="${tag}">×</button>
                </span>
            `)
            .join('');

        document.querySelectorAll('.remove-tag-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tagToRemove = e.target.getAttribute('data-tag');
                removeTag(tagToRemove);
            });
        });
    }

    function removeTag(tagToRemove) {
        selectedTags = selectedTags.filter(tag => tag !== tagToRemove);

        const option = document.createElement('option');
        option.value = tagToRemove;
        option.textContent = tagToRemove;
        tagsSelect.appendChild(option);

        if (selectedTags.length < 3) {
            addTagBtn.disabled = false;
        }

        renderSelectedTags();
        updatePreview();
    }

    postForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        const userId = parseInt(userSelect.value, 10);

        if (!title || !body || isNaN(userId) || selectedTags.length === 0) {
            alert('Please fill in all fields and add at least one tag before submitting.');
            return;
        }

        const postLenght = JSON.parse(localStorage.getItem('posts')) || [];

        const newPost = {
            id: postLenght.length + 1,
            title: title,
            body: body,
            userId: userId,
            reactions: {
                dislikes: 0,
                likes: 0,
            },
            tags: selectedTags
        };

        try {
            const posts = JSON.parse(localStorage.getItem('posts')) || [];
            posts.unshift(newPost);
            localStorage.setItem('posts', JSON.stringify(posts));

            event.target.reset();
            selectedTags = [];
            selectedTagsContainer.innerHTML = '';
            updatePreview();

            alert('Post created successfully!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving post:', error);
            alert('An error occurred while saving the post.');
        }
    });
});