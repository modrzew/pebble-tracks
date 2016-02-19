var UI = require('ui');
var Settings = require('settings');

var api = require('api');
var appUI = require('app-ui');

var CONFIG_URL = 'http://pebble.modriv.net/tracks/config';

var settingsCard = new UI.Card({
    title: 'Settings',
});

var itemCard = new UI.Card({
    title: 'Todo',
    subtitle: 'Due someday',
    body: 'Note',
    scrollable: true,
    style: 'small',
    backgroundColor: '#00FF55',
});

Settings.config(
    { url: CONFIG_URL },
    function (e) {
        console.log('Settings saved!');
        initialize();
    }
);

var menu = new UI.Menu({
    sections: [],
    highlightBackgroundColor: '#00AA55',
});

function initialize() {
    api.getTodos().then(function (contexts) {
        console.log('Resolved');
        console.log(JSON.stringify(contexts));
        for (var i=0; i<contexts.length; i++) {
            var context = contexts[i];
            var items = [];
            for (var j=0; j<context.todos.length; j++) {
                items.push(appUI.Todo2MenuItem(context.todos[j]));
            }
            menu.section(i, {title: context.name, items: items});
        }
        menu.show();
    });    
}

if (Object.keys(Settings.option()).length) {
    settingsCard.hide();
    initialize();
} else {
    settingsCard.show();
}

menu.on('select', function(e) {
    var todo = e.item.original;
    itemCard.title(todo.name);
    itemCard.subtitle(todo.getDueString());
    itemCard.body(todo.description);
    if (todo.completed) {
        itemCard.backgroundColor('#00AA55');
    } else {
        itemCard.backgroundColor('#FFAA55');
    }
    itemCard.show();
});

menu.on('longSelect', function(e) {
    var item = appUI.Todo2MenuItem(e.item.original);
    item.subtitle = 'Toggling...';
    menu.item(e.sectionIndex, e.itemIndex, item);
    api.toggle(e.item.original).then(function () {
        menu.item(e.sectionIndex, e.itemIndex, appUI.Todo2MenuItem(e.item.original));
    });
});
