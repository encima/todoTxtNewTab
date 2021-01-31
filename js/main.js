var root = document.body
const projRe = /\+\S+/g;
const listRe = /\@\S+/g;
var form = document.getElementById('auth-form');
var dbx = null;

function processTodo(txt) {
  let todos = {};
  txt.split('\n').forEach((todo) => {
    if (todo !== null && todo.length > 1) {
      var proj = todo.match(projRe);
      const lists = [...todo.matchAll(listRe)];
      td = {
        text: todo.replaceAll(listRe, '').replaceAll(projRe, ''),
        tags: lists
      }
      proj = proj[0].replace('+', '').toLowerCase()
      if(todos[proj] === undefined) {
        todos[proj] = {}
      }
      lists.forEach((list) => {
        if (todos[proj][list] === undefined) {
          todos[proj][list] = [td]
        } else {
          todos[proj][list].push(td)
        }
      })
    }
  })
  renderTodos(todos)
}

function renderTodos(todos) {
  projects = []
  for(const p in todos) {
    areas = []
    Object.entries(todos[p]).forEach(entry => {
      tasks = entry[1].map(todo => {
        return m('li', {class: ""}, [m.trust(urlify(todo['text']))])
      })
      taskList = m('ul', {class: "column col-3"}, tasks)
      areas.push(m('div', {class: "columns"}, m('h4', entry[0]), taskList))
    })
    projects.push(m('div', {class: "colum col-6"}, m('h2', p), areas))
  }
  m.render(root, m('div', {class:'columns'}, projects))

}

form.onsubmit = function listFiles(e) {
  e.preventDefault();

  var ACCESS_TOKEN = document.getElementById('access-token').value;
  dbx = new Dropbox.Dropbox({
    accessToken: ACCESS_TOKEN
  });
  dbx.filesListFolder({
      path: '/sync/todo'
    })
    .then(function(response) {
      const files = response.result.entries;
      for (var i = 0; i < files.length; i++) {
        if (files[i].name === "todo.txt") {
          getFile(files[i].path_lower)
        }
      }
    })
    .catch(function(error) {
      console.error(error);
    });
}

function getFile(path) {
  dbx.filesDownload({
      path: path
    })
    .then(function(response) {
      response.result.fileBlob.text().then(function(txt) {
        processTodo(txt)
      })
    })
    .catch(function(error) {
      console.error(error);
    });
}
