import NetRegexes from './node_modules/cactbot/resources/netregexes.js';
import './node_modules/cactbot/resources/overlay_plugin_api.js';
import UserConfig from './node_modules/cactbot/resources/user_config.js';

let Options = {};

// For now, append-only.
class ChatView {
  constructor(root) {
    this.root = root;
    this.codeToCSS = {
      '0000': 'none',
      '0001': 'debug',
      '0002': 'urgent',
      '0003': 'announce',
      '000a': 'say',
      '000b': 'shout',
      '000c': 'tell', // outgoing
      '000d': 'tell', // incoming
      '000e': 'party',
      '000f': 'alliance',
      '0010': 'linkshell1',
      '0011': 'linkshell2',
      '0012': 'linkshell3',
      '0013': 'linkshell4',
      '0014': 'linkshell5',
      '0015': 'linkshell6',
      '0016': 'linkshell7',
      '0017': 'linkshell8',
      '0018': 'fc',
      '001b': 'novicenetwork',
      '001c': 'emote', // manual
      '001d': 'emote', // built-in
      '001e': 'yell',
      '0024': 'pvpteam',
      '0025': 'cwls1',
      '0038': 'echo',
      '0039': 'message',
      '003b': 'gathering',
      '003c': 'message',
      '003d': 'retainer',
      '003e': 'gil',
      '0043': 'collectable', // gathering bonuses
      '0044': 'dialog',
      '0045': 'companyaction',
      '0046': 'login',
      '0047': 'sale',
      '0048': 'pfsearch',
      '004c': 'orchestrion',
      '0065': 'cwls2',
      '0066': 'cwls3',
      '0067': 'cwls4',
      '0068': 'cwls5',
      '0069': 'cwls6',
      '006a': 'cwls7',
      '006b': 'cwls8',
    };

    this.classToPrefix = {
      'say': 'say',
      'shout': 'shout',
      'tell': 'tell',
      'party': 'p',
      'alliance': 'a',
      'linkshell1': '1',
      'linkshell2': '2',
      'linkshell3': '3',
      'linkshell4': '4',
      'linkshell5': '5',
      'linkshell6': '6',
      'linkshell7': '7',
      'linkshell8': '8',
      'fc': 'FC',
      'emote': 'say',
      'yell': 'yell',
      'pvpteam': 'PvP',
      'gil': '$$$',
      'sale': '$$$',
      'echo': 'echo',
      'cwls1': 'CWLS1',
      'cwls2': 'CWLS2',
      'cwls3': 'CWLS3',
      'cwls4': 'CWLS4',
      'cwls5': 'CWLS5',
      'cwls6': 'CWLS6',
      'cwls7': 'CWLS7',
      'cwls8': 'CWLS8',
    };

    this.textReplace = {
      // Party numbers
      '\ue071': '(A) ',
      '\ue072': '(B) ',
      '\ue073': '(C) ',
      '\ue074': '(D) ',
      '\ue075': '(E) ',
      '\ue076': '(F) ',
      '\ue090': '1️⃣',
      '\ue091': '2️⃣',
      '\ue092': '3️⃣',
      '\ue093': '4️⃣',
      '\ue094': '5️⃣',
      '\ue095': '6️⃣',
      '\ue096': '7️⃣',
      '\ue097': '8️⃣',
      // the [>] arrow on items
      '\ue0bb': '👜',
    };
  }

  addLog(code, name, line) {
    let entryDiv = document.createElement('div');
    entryDiv.classList.add('entry', 'code-' + code);
    let lookupClass = this.codeToCSS[code];
    if (lookupClass)
      entryDiv.classList.add('type-' + lookupClass);
    this.root.appendChild(entryDiv);

    let prefixDiv = document.createElement('div');
    prefixDiv.classList.add('prefix');
    if (lookupClass) {
      let prefix = this.classToPrefix[lookupClass];
      if (prefix)
        prefixDiv.innerText = '[' + prefix + ']';
    }
    entryDiv.appendChild(prefixDiv);

    let nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    if (name) {
      for (let find in this.textReplace)
        name = name.replace(find, this.textReplace[find]);
      nameDiv.innerText = '<' + name + '>';
    }
    entryDiv.appendChild(nameDiv);

    let lineDiv = document.createElement('line');
    if (line) {
      for (let find in this.textReplace)
        line = line.replace(find, this.textReplace[find]);
      lineDiv.innerHTML = line;
    }
    lineDiv.classList.add('line');
    entryDiv.appendChild(lineDiv);

    // autoscroll to bottom
    this.root.scrollTop = this.root.scrollHeight;
  }
}

// Maybe record these for later searching, filtering, etc.
class ChatLog {
  constructor(view) {
    this.view = view;
    this.regex = NetRegexes.gameLog({ code: '00[0-9].' });
  }

  onNetLog(e) {
    const log = e.rawLine;
    let m = log.match(this.regex);
    if (!m)
      return;
    this.view.addLog(m.groups.code, m.groups.name, m.groups.line);
  }
}

UserConfig.getUserConfigLocation('chat', Options, function(e) {
  let container = document.getElementById('container');
  let chatView = new ChatView(container);
  let chatLog = new ChatLog(chatView);

  addOverlayListener('LogLine', function(e) {
    chatLog.onNetLog(e);
  });
});
