/**
 * creators.js - Voxelara Launcher
 */
 
const CREATORS_JSON_URL = 'https://voxelara.webhm.pro/data/creators.json'

const ROLE_LABELS = {
    streamer: '\u0421\u0442\u0440\u0438\u043c\u0435\u0440',
    blogger:  '\u0411\u043b\u043e\u0433\u0435\u0440',
    admin:    '\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440',
    builder:  '\u0411\u0438\u043b\u0434\u0435\u0440',
    moderator:'\u041c\u043e\u0434\u0435\u0440\u0430\u0442\u043e\u0440',
}
 
const ROLE_COLORS = {
    streamer:  '#9b59ff',
    blogger:   '#ff6b4a',
    admin:     '#f0b429',
    builder:   '#2ecc71',
    moderator: '#3498db',
}
 
const PLATFORM_DATA = {
    youtube:  { label: 'YouTube',   color: '#ff4444' },
    twitch:   { label: 'Twitch',    color: '#9147ff' },
    vk:       { label: 'ВК', color: '#4c75a3' },
    telegram: { label: 'Telegram',  color: '#29b6f6' },
    discord:  { label: 'Discord',   color: '#7289da' },
    tiktok:   { label: 'TikTok',    color: '#ff0050' },
    link:     { label: 'Сайт',      color: '#ffffff' },
}
 
let allCreators = []
let activeFilter = 'all'
let loadingListener = null
 
function setCreatorsLoading(val) {
    const span = document.getElementById('creatorsLoadSpan')
    if (val) {
        let dotStr = '..'
        if (span) span.innerHTML = 'Loading' + dotStr
        loadingListener = setInterval(() => {
            if (dotStr.length >= 3) dotStr = ''
            else dotStr += '.'
            if (span) span.innerHTML = 'Loading' + dotStr
        }, 750)
    } else {
        if (loadingListener != null) {
            clearInterval(loadingListener)
            loadingListener = null
        }
    }
}
 
async function loadCreators() {
    const grid = document.getElementById('creatorsGrid')
    grid.innerHTML = '<div id="creatorsLoading"><span id="creatorsLoadSpan">Loading..</span></div>'
    setCreatorsLoading(true)
 
    try {
        const res = await fetch(CREATORS_JSON_URL + '?v=' + Date.now())
        const buffer = await res.arrayBuffer()
        const text = new TextDecoder('windows-1251').decode(buffer)
        const data = JSON.parse(text)
        allCreators = data.creators || []
        setCreatorsLoading(false)
        renderCreators(allCreators)
    } catch (err) {
        setCreatorsLoading(false)
        grid.innerHTML = '<div class="creatorsError">Failed to load creators.<br>Check your internet connection.</div>'
    }
}
 
function renderCreators(list) {
    const grid = document.getElementById('creatorsGrid')
    grid.innerHTML = ''
 
    const filtered = activeFilter === 'all'
        ? list
        : list.filter(c => {
            const main  = (c.role || '').toLowerCase()
            const extra = (c.extra_role || '').toLowerCase()
            return main === activeFilter || extra === activeFilter
        })
 
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="creatorsError">No creators in this category</div>'
        return
    }
 
    filtered.forEach((creator, i) => {
        grid.appendChild(createCard(creator, i))
    })
}
 
function createCard(creator, index) {
    const roleKey    = (creator.role || 'default').toLowerCase()
    const roleLabel  = ROLE_LABELS[roleKey]  || creator.role  || 'Member'
    const roleColor  = ROLE_COLORS[roleKey]  || '#ffffff'
 
    const extraKey   = (creator.extra_role || '').toLowerCase()
    const extraLabel = ROLE_LABELS[extraKey] || creator.extra_role || ''
    const extraColor = ROLE_COLORS[extraKey] || '#aaaaaa'
 
    const skinSrc = creator.uuid
        ? `https://visage.surgeplay.com/bust/256/${creator.uuid}`
        : 'assets/images/SealCircle.png'
 
    const socials = creator.socials || []
    const socialsHTML = socials.map(s => {
        const platform = s.platform || 'link'
        const pd = PLATFORM_DATA[platform] || PLATFORM_DATA.link
        return `<a class="creatorSocialBtn"
                   href="${escapeHTML(s.url)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="--sc:${pd.color};"
                   title="${escapeHTML(pd.label)}">
                    ${escapeHTML(pd.label)}
                </a>`
    }).join('')
 
    const card = document.createElement('div')
    card.className = 'creatorCard'
    card.dataset.role = roleKey
    card.style.animationDelay = `${index * 60}ms`
 
    card.innerHTML = `
        <div class="creatorCardSkin">
            <img
                class="creatorSkinImg"
                src="${escapeHTML(skinSrc)}"
                alt="${escapeHTML(creator.name)}"
                onerror="this.src='assets/images/SealCircle.png'"
            >
        </div>
        <div class="creatorCardBody">
            <div class="creatorCardTop">
                <div class="creatorCardName">${escapeHTML(creator.name)}</div>
                <div class="creatorCardRoles">
                    <div class="creatorCardRole" style="color:${roleColor};border-color:${roleColor};">${escapeHTML(roleLabel)}</div>
                    ${extraLabel ? `<div class="creatorCardRoleExtra" style="color:${extraColor};border-color:${extraColor};">${escapeHTML(extraLabel)}</div>` : ''}
                </div>
            </div>
            ${creator.description ? `<div class="creatorCardDesc">${escapeHTML(creator.description)}</div>` : ''}
            <div class="creatorCardSocials">${socialsHTML}</div>
        </div>
    `
 
    return card
}
 
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}
 
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.creatorsNavItem')
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            navItems.forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
            activeFilter = btn.dataset.role
            renderCreators(allCreators)
        })
    })
 
    const doneBtn = document.getElementById('creatorsNavDone')
    if (doneBtn) {
        doneBtn.addEventListener('click', () => {
            switchView(VIEWS.creators, VIEWS.landing)
        })
    }
})