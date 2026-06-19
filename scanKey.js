const actionKeys = require('./actionKeys.json');
const path = require('path');
const fs = require('fs');

const outputFile = path.join(__dirname, 'actionKeysMap2.json');

const scan = () => {
    const keys1 = actionKeys.map(item => item.cate_code)
    const keys2 = actionKeys.map(item => item.cate_name)
    const keys3 = actionKeys.map(item => item.group_code)
    const keys4 = actionKeys.map(item => item.group_name)
    const keys5 = actionKeys.map(item => item.key)
    const keys6 = actionKeys.map(item => item.name)
    const keys7 = actionKeys.map(item => item.router)
    const keys8 = actionKeys.map(item => item.actions)?.map(item => (item || []).join(', '))
    // const keys = actionKeys.map(item => item.actions)?.map(item => (item || []).join(', '))
    // console.log({ keys })

    fs.writeFileSync(path.join(__dirname, 'actionKeysMap1.json'), JSON.stringify(keys1, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap2.json'), JSON.stringify(keys2, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap3.json'), JSON.stringify(keys3, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap4.json'), JSON.stringify(keys4, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap5.json'), JSON.stringify(keys5, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap6.json'), JSON.stringify(keys6, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap7.json'), JSON.stringify(keys7, null, 2), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'actionKeysMap8.json'), JSON.stringify(keys8, null, 2), 'utf8');
}

scan();
// console.log({ actionKeys });