import { Markmap } from './viewtree';
import {makeDataObj } from './utils';

let treeview = null;

const loadTreeData = (hashdata, diaginput, ishash) => {
    const diagstr = diaginput.value;
    diaginput.value = '';
    treeview?.destroy();
    treeview = Markmap.create('svg#mindmap', hashdata, diagstr, ishash);
};

const loadActualData = (hashdata, ishash) => {
    treeview?.destroy();
    treeview = Markmap.create('svg#mindmap', hashdata, null, ishash);
};

function searchHandler(e, hashkeys, suggestions) {
    const inputVal = e.currentTarget.value;
    var results = [];
    if (inputVal.length > 0) {
        const val = inputVal.toLowerCase();
        for (let i = 0; i < hashkeys.length; i++) {
            if (hashkeys[i].toLowerCase().indexOf(val) > -1) {
                results.push(hashkeys[i]);
            }
        }
    }
    suggestions.innerHTML = '';
    if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            let item = results[i];
            const match = item.match(new RegExp(inputVal, 'i'));
            item = item.replace(match[0], `<strong>${match[0]}</strong>`);
            suggestions.innerHTML += `<li>${item}</li>`;
        }
        suggestions.classList.add('has-suggestions');
    } else {
        results = [];
        suggestions.innerHTML = '';
        suggestions.classList.remove('has-suggestions');
    }
}

function useSuggestion(e, hashdata, diaginput, ishash, suggestions) {
    diaginput.value = e.target.innerText;
    diaginput.focus();
    suggestions.innerHTML = '';
    suggestions.classList.remove('has-suggestions');
    loadTreeData(hashdata, diaginput, ishash);
}


if(!ishashmap)
{
    loadActualData(datajson, ishashmap);
}
else
{
    const inputcont = document.createElement("div");
    inputcont.className = "container";
    inputcont.id = "inputcont";
    const inputform = document.createElement("form");
    const diaginput = document.createElement("input");
    diaginput.id = "diaginput";
    diaginput.type = "text";
    diaginput.placeholder = "Search...";
    const diagbtn = document.createElement("button");
    diagbtn.id = "diagbtn";
    diagbtn.type = "button";
    diagbtn.textContent = "Search";
    const suggestul = document.createElement("div");
    suggestul.id = "suggestul";
    suggestul.className = "suggestions";
    document.body.appendChild(inputcont);
    inputcont.appendChild(inputform);
    inputform.appendChild(diaginput);
    inputform.appendChild(diagbtn);
    inputform.appendChild(suggestul);
    const sugg = document.createElement("ul");
    suggestul.appendChild(sugg);

    const hashdata = makeDataObj(datajson);
    const hashkeys = Object.keys(hashdata);
  
    inputcont.style.display = 'flex';
  
    diaginput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadTreeData(hashdata, diaginput, ishashmap);
        }
    });
    diaginput.addEventListener('keyup', (e) => searchHandler(e, hashkeys, suggestul));
    diagbtn.addEventListener('click', () => loadTreeData(hashdata, diaginput, ishashmap));
    suggestul.addEventListener('click', (e) => useSuggestion(e, hashdata, diaginput, ishashmap, suggestul));
}

