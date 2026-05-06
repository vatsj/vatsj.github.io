(() => {
  const tabs = document.querySelectorAll('nav button[data-tab]');
  const sections = document.querySelectorAll('.tab-content');
  const blogList = document.getElementById('blog-list');
  const blogPost = document.getElementById('blog-post');
  const blogPostContent = document.getElementById('blog-post-content');
  const blogBack = document.getElementById('blog-back');

  // Tab switching
  function activateTab(tabName) {
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    sections.forEach(sec => sec.classList.toggle('active', sec.id === tabName));
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      activateTab(tab);
      window.location.hash = tab;
      if (tab === 'blog') showBlogList();
    });
  });

  // Blog list
  let blogPosts = [];

  async function loadBlogManifest() {
    try {
      const res = await fetch('blog/index.json');
      blogPosts = await res.json();
      renderBlogList();
    } catch {
      blogList.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Could not load posts.</p>';
    }
  }

  function renderBlogList() {
    blogList.innerHTML = '';
    blogPosts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'blog-card';
      card.innerHTML = `<h3>${post.title}</h3><div class="date">${post.date}</div>`;
      card.addEventListener('click', () => {
        window.location.hash = 'blog/' + post.slug;
      });
      blogList.appendChild(card);
    });
  }

  function showBlogList() {
    blogList.style.display = '';
    blogPost.hidden = true;
  }

  async function showPost(slug) {
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return;

    try {
      const res = await fetch('blog/' + post.file);
      const md = await res.text();
      blogPostContent.innerHTML = marked.parse(md);
      blogList.style.display = 'none';
      blogPost.hidden = false;
    } catch {
      blogPostContent.innerHTML = '<p style="color: var(--text-muted);">Could not load post.</p>';
      blogList.style.display = 'none';
      blogPost.hidden = false;
    }
  }

  blogBack.addEventListener('click', () => {
    window.location.hash = 'blog';
  });

  // Hash routing
  function handleHash() {
    const hash = window.location.hash.slice(1) || 'about';

    if (hash.startsWith('blog/')) {
      const slug = hash.slice(5);
      activateTab('blog');
      if (blogPosts.length === 0) {
        loadBlogManifest().then(() => showPost(slug));
      } else {
        showPost(slug);
      }
    } else {
      activateTab(hash);
      if (hash === 'blog') showBlogList();
    }
  }

  window.addEventListener('hashchange', handleHash);

  // Init
  loadBlogManifest();
  handleHash();
})();
