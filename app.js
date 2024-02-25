/*<cockroachai-web-code>
版权所有 (C) <2024> <lyy0709>

本程序是自由软件：您可以根据自由软件基金会发布的GNU通用公共许可证条款，对其进行重新分配和/或修改，无论是其第3版，还是（根据您的选择）任何后续版本。

本程序是在希望能有用的前提下发布的，但不提供任何保证；甚至没有适销性和特定用途适用性的隐含保证。有关更多详情，请参阅GNU通用公共许可证。

您应该已经收到一份GNU通用公共许可证的副本以及本程序。如果没有，请参见 <https://www.gnu.org/licenses/>。*/

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
    const tokenManagement = document.getElementById('tokenManagement');
    const tokenList = document.getElementById('tokenList');
    const addTokenForm = document.getElementById('addTokenForm');
    const errorDiv = document.getElementById('error');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止表单的默认提交行为

        const password = document.getElementById('password').value;
        // 假设你已经有了一个后端API来验证密码
        fetch('/api/validate-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 密码正确，显示Token管理部分
                    document.getElementById('loginSection').style.display = 'none';
                    // 显示Token管理部分
                    document.getElementById('tokenManagementSection').style.display = 'block';
                    loadTokens(); // 加载并显示Token
                } else {
                    // 密码错误，显示错误消息并清空密码输入框
                    showError('密码错误');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('验证密码时发生错误');
            });
    });

    function loadTokens() {
        fetch('/api/config')
            .then(response => response.json())
            .then(data => {
                displayTokens(data.USERTOKENS);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('获取令牌失败');
            });
    }

    addTokenForm.addEventListener('submit', function(event) {
        event.preventDefault(); // 阻止表单的默认提交行为

        const newToken = document.getElementById('newToken').value;
        fetch('/api/tokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: newToken
                }),
            })
            .then(response => {
                if (response.ok) {
                    loadTokens(); // 重新加载Token以包括新添加的Token
                    document.getElementById('newToken').value = ''; // 清空输入框
                } else {
                    response.text().then(text => showError(text));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('添加令牌失败');
            });
    });

    function displayTokens(tokens) {
        const tokenList = document.getElementById('tokenList');
        tokenList.innerHTML = ''; // 清空现有Token
        tokens.forEach(token => {
            const li = document.createElement('li');
            const tokenDiv = document.createElement('div');
            tokenDiv.textContent = token;
            tokenDiv.classList.add('token-text');
            li.appendChild(tokenDiv);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.onclick = function() {
                // 在这里添加删除Token的逻辑
                fetch(`/api/tokens/${token}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            li.remove(); // 从列表中移除该Token
                        } else {
                            console.error('删除令牌失败');
                        }
                    });
            };

            li.appendChild(deleteBtn); // 将按钮添加到列表项中
            tokenList.appendChild(li); // 将列表项添加到Token列表中
        });
    }

    function showError(message) {
        errorDiv.textContent = message; // 设置错误消息
        errorDiv.style.display = 'block'; // 显示错误消息
        document.getElementById('password').value = ''; // 清空密码输入框
    }
    // 新按钮的事件监听器
    document.getElementById('getSessionButton').addEventListener('click', function() {
        window.location.href = 'http://' + window.location.hostname + ':9000/getsession';
    });
        document.getElementById('restartContainer').addEventListener('click', function(){
            var containerName = document.getElementById('containerName').value;
            fetch('/api/recreate-and-start-container', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ containerName: containerName }),
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });

    // 从localStorage加载状态
    const savedEnabled = localStorage.getItem('refreshCookieEnabled') === 'true';
    const savedValue = localStorage.getItem('refreshCookieValue') || '';

    // 设置复选框和输入框的状态
    const refreshCookieEnabledCheckbox = document.getElementById('refreshCookieEnabled');
    const refreshCookieValueInput = document.getElementById('refreshCookieValue');
    refreshCookieEnabledCheckbox.checked = savedEnabled;
    refreshCookieValueInput.disabled = !savedEnabled; // 当开关关闭时禁用输入
    if (savedEnabled) {
        refreshCookieValueInput.value = savedValue;
    }
});

document.getElementById('refreshCookieEnabled').addEventListener('change', function() {
    const isChecked = this.checked;

    // 更新localStorage中的开关状态
    localStorage.setItem('refreshCookieEnabled', isChecked);

    const refreshCookieValueInput = document.getElementById('refreshCookieValue');
    refreshCookieValueInput.disabled = !isChecked; // 根据开关状态启用或禁用输入框

    if (!isChecked) {
        refreshCookieValueInput.value = ''; // 如果开关关闭，清空输入框但不更新localStorage中的值
    }
});

document.getElementById('updateRefreshCookie').addEventListener('click', function() {
    const refreshCookieEnabledCheckbox = document.getElementById('refreshCookieEnabled');
    const enabled = refreshCookieEnabledCheckbox.checked;
    const refreshCookieValueInput = document.getElementById('refreshCookieValue');
    const value = enabled ? refreshCookieValueInput.value : ''; // 如果开关关闭，则值为默认状态

    if (!enabled) {
        localStorage.setItem('refreshCookieValue', ''); // 如果开关关闭，更新localStorage为默认值
    } else {
        localStorage.setItem('refreshCookieValue', value); // 如果开关开启，保存当前值到localStorage
    }

    fetch('/api/refresh-cookie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                enabled,
                value
            }),
        })
        .then(response => {
            if (response.ok) {
                alert('REFRESHCOOKIE 更新成功');
            } else {
                response.text().then(text => showError(text));
            }
        })
        .catch(error => {
            console.error('error:', error);
            showError('REFRESHCOOKIE 更新失败');
        });
});

function showError(message) {
    // 实现显示错误信息的逻辑
    console.error(message); // 作为示例
}
