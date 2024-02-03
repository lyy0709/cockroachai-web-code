/*<cockroachai-web-code>
版权所有 (C) <2024> <lyy0709>

本程序是自由软件：您可以根据自由软件基金会发布的GNU通用公共许可证条款，对其进行重新分配和/或修改，无论是其第3版，还是（根据您的选择）任何后续版本。

本程序是在希望能有用的前提下发布的，但不提供任何保证；甚至没有适销性和特定用途适用性的隐含保证。有关更多详情，请参阅GNU通用公共许可证。

您应该已经收到一份GNU通用公共许可证的副本以及本程序。如果没有，请参见 <https://www.gnu.org/licenses/>。*/
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const yaml = require('js-yaml');
const app = express();
const port = 8999;

app.use(bodyParser.json());
app.use(express.static('/usr/src/app'));
const CONFIG_PATH = process.env.CONFIG_PATH; // 使用环境变量中定义的路径


function readConfig() {
    try {
        const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
        return yaml.load(fileContents);
    } catch (e) {
        console.error(e);
        return null;
    }
}

function saveConfig(config) {
    try {
        const yamlStr = yaml.dump(config);
        fs.writeFileSync(CONFIG_PATH, yamlStr, 'utf8');
    } catch (e) {
        console.error(e);
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/config', (req, res) => {
    const config = readConfig();
    if (config) {
        const {
            ADMIN_PASSWORD,
            ...rest
        } = config; // 从响应中排除ADMIN_PASSWORD
        res.json(rest);
    } else {
        res.status(500).send('Error reading config file');
    }
});

app.post('/api/validate-password', (req, res) => {
    const {
        password
    } = req.body; // 从请求体中获取密码
    const config = readConfig(); // 读取配置文件

    if (config && password === config.ADMIN_PASSWORD) {
        res.json({
            success: true
        }); // 密码匹配
    } else {
        res.json({
            success: false
        }); // 密码不匹配
    }
});


app.post('/api/tokens', (req, res) => {
    const {
        token
    } = req.body;
    if (!token) {
        return res.status(400).send('Token is required');
    }

    const config = readConfig();
    if (config) {
        if (!config.USERTOKENS.includes(token)) {
            config.USERTOKENS.push(token);
            saveConfig(config);
            res.send('Token added');
        } else {
            res.status(400).send('Token already exists');
        }
    } else {
        res.status(500).send('Error reading config file');
    }
});

app.delete('/api/tokens/:token', (req, res) => {
    const {
        token
    } = req.params;

    const config = readConfig();
    if (config) {
        const index = config.USERTOKENS.indexOf(token);
        if (index > -1) {
            config.USERTOKENS.splice(index, 1);
            saveConfig(config);
            res.send('Token deleted');
        } else {
            res.status(404).send('Token not found');
        }
    } else {
        res.status(500).send('Error reading config file');
    }
});

// 处理REFRESHCOOKIE更新的路由
app.post('/api/refresh-cookie', (req, res) => {
    const {
        enabled,
        value
    } = req.body; // 从请求体中获取开关状态和REFRESHCOOKIE的值

    const config = readConfig(); // 读取当前配置
    if (!config) {
        return res.status(500).send('Error reading config file');
    }

    // 根据开关状态更新REFRESHCOOKIE
    config.REFRESHCOOKIE = enabled ? `"${value}"` : "";

    saveConfig(config); // 保存更新后的配置

    res.send('REFRESHCOOKIE updated successfully');
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});
