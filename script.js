let posts = [];
let currentEditingId = null;

// DOM elements //
const postForm = document.getElementById("post-form");
const titleInput = document.getElementById("post-title");
const contentInput = document.getElementById("post-content");
const titleError = document.getElementById("title-error");
const contentError = document.getElementById("content-error");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const postsContainer = document.getElementById("posts-container");

// initialize the application when the page loads //
document.addEventListener("DOMContentLoaded", function () {
  loadPostsFromStorage();
  renderPosts();

  // Event listeners //
  postForm.addEventListener("submit", handleFormSubmit);
  cancelEditBtn.addEventListener("click", cancelEdit);
});

// load posts from localStorage //
function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("blogPosts");
  if (storedPosts) {
    try {
      posts = JSON.parse(storedPosts);
    } catch (error) {
      console.error("Error parsing posts from localStorage:", error);
      posts = [];
    }
  }
}

// save posts to localStorage //
function savePostsToStorage() {
  try {
    localStorage.setItem("blogPosts", JSON.stringify(posts));
  } catch (error) {
    console.error("Error saving posts to localStorage:", error);
  }
}

// generate a unique ID for posts //
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

// format timestamp for display //
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
}

// clear error messages //
function clearErrors() {
  titleError.textContent = "";
  contentError.textContent = "";
}

// Validate form inputs //
function validateForm() {
  clearErrors();
  let isValid = true;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title) {
    titleError.textContent = "Post title is required";
    isValid = false;
  }

  if (!content) {
    contentError.textContent = "Post content is required";
    isValid = false;
  }

  return isValid;
}

// create and edit //
function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (currentEditingId) {
   
    updatePost(currentEditingId, title, content); // update existing post 
  } else {
    
    createNewPost(title, content); // create new post 
  }

  // clear form and reset state //
  clearForm();
  renderPosts();
}

// create new post //
function createNewPost(title, content) {
  const newPost = {
    id: generateId(),
    title: title,
    content: content,
    timestamp: Date.now(),
  };

  posts.unshift(newPost); // The beginning of the array 
  savePostsToStorage();
}

// update existing post //
function updatePost(id, title, content) {
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex !== -1) {
    posts[postIndex].title = title;
    posts[postIndex].content = content;
    posts[postIndex].timestamp = Date.now(); // update timestamp //
    savePostsToStorage();
  }

  // reset editing state //
  currentEditingId = null;
  submitBtn.textContent = "Add Post";
  cancelEditBtn.style.display = "none";
}

// clear the form //
function clearForm() {
  titleInput.value = "";
  contentInput.value = "";
  clearErrors();
}

// cancel editing mode //
function cancelEdit() {
  currentEditingId = null;
  submitBtn.textContent = "Add Post";
  cancelEditBtn.style.display = "none";
  clearForm();
}

// render all posts //
function renderPosts() {
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML =
      '<div class="empty-state">Nothing here yet. Write your first post above.</div>';
    return;
  }

  posts.forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}


function createPostElement(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "post";
  postDiv.setAttribute("data-id", post.id);

  postDiv.innerHTML = `
    <div class="post-header">
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <span class="post-timestamp">${formatTimestamp(post.timestamp)}</span>
    </div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    <div class="post-actions">
      <button class="edit-btn" onclick="editPost('${post.id}')">Edit</button>
      <button class="delete-btn" onclick="deletePost('${post.id}')">Delete</button>
    </div>
  `;

  return postDiv;
}

// escape HTML to prevent XSS attacks //
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// edit a post //
function editPost(id) {
  const post = posts.find((post) => post.id === id);
  if (!post) {
    console.error("Post not found:", id);
    return;
  }

  // populate form with post data //
  titleInput.value = post.title;
  contentInput.value = post.content;

  // set editing mode //
  currentEditingId = id;
  submitBtn.textContent = "Update Post";
  cancelEditBtn.style.display = "inline-block";

  // scroll to form //
  postForm.scrollIntoView({ behavior: "smooth" });

  // focus on title input //
  titleInput.focus();
}

// delete a post //
function deletePost(id) {
  // ask for confirmation //
  if (!confirm("Are you certain you want to delete this post? It cannot be restored.")) {
    return;
  }

  // remove post from array //
  posts = posts.filter((post) => post.id !== id);

  // editing post, cancel  //
  if (currentEditingId === id) {
    cancelEdit();
  }

  // save and re-render //
  savePostsToStorage();
  renderPosts();
}

//  function to get posts//
function getAllPosts() {
  return posts;
}

//  clear all posts //
function clearAllPosts() {
  if (confirm("Are you sure? All posts will be lost forever.")) {
    posts = [];
    savePostsToStorage();
    renderPosts();
    cancelEdit();
  }
}

// add this to global scope //
window.blogUtils = {
  getAllPosts,
  clearAllPosts,
};

// edit and delete functions available globally for onclick handlers //
window.editPost = editPost;
window.deletePost = deletePost;
