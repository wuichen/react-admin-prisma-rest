import { AuthProvider } from 'ra-core';
import jwtDecode from 'jwt-decode'
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
        const decoded = jwtDecode(json.token)
        if (decoded && decoded.permissions) {
            localStorage.setItem('permissions', JSON.stringify(decoded.permissions));
        }
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
    getPermissions: async () => {
        const permissions = localStorage.getItem('permissions');
        const token = localStorage.getItem('token');

        return token ? (permissions ? Promise.resolve(JSON.parse(permissions)) : Promise.resolve({})) : Promise.reject();
    },
};

export default authProvider;
