'use strict';
// AutoHotkey backend for macro "ahk" steps (Windows only). We only shell out to an installed
// AutoHotkey.exe — never bundle/link it — so there's no GPL entanglement. The script value is either a
// path to a .ahk file or an inline AutoHotkey v2 snippet (written to a temp .ahk and run, then cleaned up).
//
// AutoHotkey is a user-installed dependency; if it's missing we log a one-time hint and no-op. An "ahk"
// step runs arbitrary user-authored code — same trust level as the existing "cmd" tile type.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

let cachedExe;   // undefined = not looked up yet · null = looked up, not found · string = resolved path
let warned = false;

// Resolve AutoHotkey.exe: an explicit override, then common install dirs, then PATH. Cached.
function findAhkExe(extraPath) {
  if (cachedExe !== undefined) return cachedExe;
  const candidates = [];
  if (extraPath && typeof extraPath === 'string') candidates.push(extraPath);
  const bases = [process.env.ProgramFiles || 'C:\\Program Files', process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'];
  for (const base of bases) {
    candidates.push(
      path.join(base, 'AutoHotkey', 'v2', 'AutoHotkey.exe'),
      path.join(base, 'AutoHotkey', 'v2', 'AutoHotkey64.exe'),
      path.join(base, 'AutoHotkey', 'AutoHotkey.exe'),
      path.join(base, 'AutoHotkey', 'AutoHotkey64.exe'),
    );
  }
  for (const c of candidates) { try { if (c && fs.existsSync(c)) { cachedExe = c; return cachedExe; } } catch (e) {} }
  try {
    const out = execFileSync('where', ['AutoHotkey.exe'], { windowsHide: true }).toString();
    const first = out.split(/\r?\n/).map(s => s.trim()).find(Boolean);
    if (first && fs.existsSync(first)) { cachedExe = first; return cachedExe; }
  } catch (e) {}
  cachedExe = null;
  return cachedExe;
}

function looksLikeFile(v) { return /\.ahk$/i.test(String(v || '').trim()); }

// Run an ahk step. opts.ahkPath = optional user override of the exe location.
function run(value, opts) {
  if (process.platform !== 'win32') return false;
  const v = String(value == null ? '' : value).trim();
  if (!v) return false;
  const exe = findAhkExe(opts && opts.ahkPath);
  if (!exe) {
    if (!warned) { warned = true; console.log('AutoHotkey not found — install AutoHotkey v2 (or set its path) to use AHK macro steps.'); }
    return false;
  }
  let scriptPath, temp = false;
  if (looksLikeFile(v)) {
    if (!fs.existsSync(v)) { console.log('AHK script not found:', v); return false; }
    scriptPath = v;
  } else {
    try {
      scriptPath = path.join(os.tmpdir(), 'oq-macro-' + Date.now() + '-' + Math.round(Math.random() * 1e6) + '.ahk');
      fs.writeFileSync(scriptPath, '#Requires AutoHotkey v2\n#SingleInstance Off\n' + v + '\n');
      temp = true;
    } catch (e) { console.log('AHK temp write failed:', e.message); return false; }
  }
  try {
    const child = spawn(exe, [scriptPath], { detached: true, stdio: 'ignore', windowsHide: true });
    if (child && child.unref) child.unref();
  } catch (e) { console.log('AHK spawn failed:', e.message); return false; }
  if (temp) setTimeout(() => { try { fs.unlinkSync(scriptPath); } catch (e) {} }, 15000);   // give AHK time to read it
  return true;
}

// Re-detect the exe (e.g. after the user installs AHK or sets a path).
function resetCache() { cachedExe = undefined; warned = false; }

module.exports = { run, findAhkExe, resetCache };
