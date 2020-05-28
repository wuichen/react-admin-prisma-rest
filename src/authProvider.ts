import { AuthProvider } from 'ra-core';

const authProvider: AuthProvider = {
    login: async ({ username }) => {
        const response = await fetch('/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: username,
                password: ""
            })
        })
        const json: any = await response.json()
        console.log(json)
        localStorage.setItem('token', json.token)
        localStorage.setItem('user', JSON.stringify(json.user))

        localStorage.setItem('username', username);
        // accept all username/password combinations
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem('username');
        return Promise.resolve();
    },
    checkError: () => Promise.resolve(),
    checkAuth: () =>
        localStorage.getItem('username') ? Promise.resolve() : Promise.reject(),
    getPermissions: () => Promise.reject('Unknown method'),
};

export default authProvider;
