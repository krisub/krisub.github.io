let currentLanyardData = null;

const iconWidth = 12;
const iconHeight = 12;

const statusIcons = {
  online: `<svg style="pointer-events: none;" width="${iconWidth}" height="${iconHeight}" viewBox="0 0 1 1"><defs><mask id="svg-mask-status-online" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1"><circle fill="white" cx="0.5" cy="0.5" r="0.5"></circle></mask></defs><rect fill="#23a559" width="1" height="1" mask="url(#svg-mask-status-online)"></rect></svg>`,
  idle: `<svg style="pointer-events: none;" width="${iconWidth}" height="${iconHeight}" viewBox="0 0 1 1"><defs><mask id="svg-mask-status-idle" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1"><circle fill="white" cx="0.5" cy="0.5" r="0.5"></circle><circle fill="black" cx="0.25" cy="0.25" r="0.375"></circle></mask></defs><rect fill="#f0b232" width="1" height="1" mask="url(#svg-mask-status-idle)"></rect></svg>`,
  dnd: `<svg style="pointer-events: none;" width="${iconWidth}" height="${iconHeight}" viewBox="0 0 1 1"><defs><mask id="svg-mask-status-dnd" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1"><circle fill="white" cx="0.5" cy="0.5" r="0.5"></circle><rect fill="black" x="0.125" y="0.375" width="0.75" height="0.25" rx="0.125" ry="0.125"></rect></mask></defs><rect fill="#f23f43" width="1" height="1" mask="url(#svg-mask-status-dnd)"></rect></svg>`,
  offline: `<svg style="pointer-events: none;" width="${iconWidth}" height="${iconHeight}" viewBox="0 0 1 1"><defs><mask id="svg-mask-status-offline" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1"><circle fill="white" cx="0.5" cy="0.5" r="0.5"></circle><circle fill="black" cx="0.5" cy="0.5" r="0.25"></circle></mask></defs><rect fill="#80848e" width="1" height="1" mask="url(#svg-mask-status-offline)"></rect></svg>`,
};

const iconController = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#45a366" fill-rule="evenodd" d="M20.97 4.06c0 .18.08.35.24.43.55.28.9.82 1.04 1.42.3 1.24.75 3.7.75 7.09v4.91a3.09 3.09 0 0 1-5.85 1.38l-1.76-3.51a1.09 1.09 0 0 0-1.23-.55c-.57.13-1.36.27-2.16.27s-1.6-.14-2.16-.27c-.49-.11-1 .1-1.23.55l-1.76 3.51A3.09 3.09 0 0 1 1 17.91V13c0-3.38.46-5.85.75-7.1.15-.6.49-1.13 1.04-1.4a.47.47 0 0 0 .24-.44c0-.7.48-1.32 1.2-1.47l2.93-.62c.5-.1 1 .06 1.36.4.35.34.78.71 1.28.68a42.4 42.4 0 0 1 4.4 0c.5.03.93-.34 1.28-.69.35-.33.86-.5 1.36-.39l2.94.62c.7.15 1.19.78 1.19 1.47ZM20 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 7a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 1 1 0-2h1V7Z" clip-rule="evenodd"></path></svg>`;

const iconSpotify = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#45a366" d="M8.65 1.51A2 2 0 0 0 6 3.41v9.88A3.98 3.98 0 0 0 4.5 13C2.57 13 1 14.34 1 16s1.57 3 3.5 3S8 17.66 8 16V5.4l11 3.81v7.08a3.98 3.98 0 0 0-1.5-.29c-1.93 0-3.5 1.34-3.5 3s1.57 3 3.5 3 3.5-1.34 3.5-3V7.03c0-.74-.47-1.4-1.18-1.65L8.65 1.51Z"></path></svg>`;

async function fetchDiscordStatus() {
  try {
    const res = await fetch(`https://discord-status.krisub.workers.dev`);
    const { data } = await res.json();
    currentLanyardData = data;
    renderStatus();
  } catch (error) {
    console.error("Error fetching Discord status:", error);
  }
}

function renderStatus() {
  if (!currentLanyardData) return;
  const data = currentLanyardData;

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hoverTexts = {
    online: "online!",
    offline: "offline",
    idle: "idle...",
    dnd: "DND",
  };

  const headerIcon = document.getElementById("discord-status-icon");
  if (headerIcon) {
    headerIcon.innerHTML =
      statusIcons[data.discord_status] || statusIcons.offline;
    headerIcon.title = hoverTexts[data.discord_status] || "offline";
  }

  let html = "";

  if (data.spotify && data.spotify.timestamps) {
    const sp = data.spotify;
    const now = Date.now();
    const start = sp.timestamps.start;
    const end = sp.timestamps.end;

    const currentMs = Math.max(0, Math.min(now - start, end - start));
    const totalMs = end - start;
    const progressRatio = currentMs / totalMs;

    const barLength = 10;
    const pipPos = Math.floor(progressRatio * barLength);
    let barStr = "&lt;";
    for (let i = 0; i < barLength; i++) barStr += i === pipPos ? "|" : "-";
    barStr += "&gt;";

    html += `<div style="display: grid; grid-template-columns: 16px 20px 1fr; align-items: center; gap: 8px; margin-bottom: 5px;">
                <span title="listening to..." style="display: flex; cursor: default;">${iconSpotify}</span>
                <img src="${sp.album_art_url}" width="20" height="20" style="border-radius: 4px;" alt="Album Art">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <a href="https://open.spotify.com/track/${sp.track_id}" target="_blank" title="${sp.song} by ${sp.artist}" style="width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${sp.song}</a>
                    <span style="font-family: monospace; white-space: pre;">[${formatTime(currentMs)}] ${barStr} [${formatTime(totalMs)}]</span>
                </div>
             </div>`;
  }

  const games = data.activities.filter((a) => a.type === 0);
  if (games.length > 0) {
    const game = games[0];

    let timePlayedStr = "";
    if (game.timestamps && game.timestamps.start) {
      timePlayedStr = ` [${formatTime(Date.now() - game.timestamps.start)}]`;
    }

    let gameArt = "<div></div>"; // Default empty div if no image

    if (game.assets && game.assets.large_image && game.application_id) {
      let assetId = game.assets.large_image;
      let imgUrl = assetId.startsWith("mp:")
        ? `https://media.discordapp.net/${assetId.substring(3)}`
        : `https://cdn.discordapp.com/app-assets/${game.application_id}/${assetId}.webp`;
      gameArt = `<img src="${imgUrl}" width="20" height="20" style="border-radius: 4px;" alt="Game Art">`;
    } else if (game.application_id) {
      gameArt = `<img src="https://dcdn.dstn.to/app-icons/${game.application_id}" width="20" height="20" style="border-radius: 4px;" alt="Game Art">`;
    }

    html += `<div style="display: grid; grid-template-columns: 16px 20px 1fr; align-items: center; gap: 8px;">
                <span title="playing..." style="display: flex; cursor: default;">${iconController}</span> 
                ${gameArt} 
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${game.name}</span>
                    <span style="font-family: monospace;">${timePlayedStr}</span>
                </div>
             </div>`;
  }

  document.getElementById("discord-status").innerHTML = html;
}

fetchDiscordStatus();
setInterval(() => {
    if (!document.hidden) {
        fetchDiscordStatus();
    }
}, 10000);
setInterval(renderStatus, 1000);
