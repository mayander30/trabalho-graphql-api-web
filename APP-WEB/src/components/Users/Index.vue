
<template>
    <div>
        <h1>Usuários</h1>
        <div class="row">
            <div class="col-md-6">
                <table class="table">
                    <thead class="thead-dark">
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                    </thead>
                    <tbody>
                        <tr v-for="user in allUser" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>

    import gql from 'graphql-tag';

    export default {
        data: () => ({
            users: [],
            loading: 0,
            teste: '',
            allUser: []
        }),
        computed: {
            
        },
        apollo: {
            teste: gql`query {
                teste
            }`,
            allUser: gql`{
                allUser {
                    id,
                    name,
                    email
                }
            }`
        },
        created() {
           console.log( this.users );
        },
        methods: {
            editUser (user) {
                console.log(user)
            }
        }
    }
</script>

<style>
    
</style>