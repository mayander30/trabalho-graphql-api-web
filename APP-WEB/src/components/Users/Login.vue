
<template>
    <div>
        <h1>Login</h1>
        <div class="row">
            <div class="col-md-4"></div>
            <div class="col-md-4">
                <div class="form-group row">
                    <label  class="col-sm-2 col-form-label">Email</label>
                    <div class="col-sm-10">
                        <input type="text" class="form-control" v-model="user.email">
                    </div>
                </div>
                <div class="form-group row">
                        <label for="inputPassword" class="col-sm-2 col-form-label">Password</label>
                    <div class="col-sm-10">
                        <input type="password" v-model="user.password" class="form-control" placeholder="Password">
                    </div>
                </div>

                <button class="btn btn-success" @click="login">Login</button>
            </div>
            <div class="col-md-4"></div>
        </div>
    </div>
</template>

<script>

    import gql from 'graphql-tag';
    // GraphQL query
    export default {
        data: () => ({
            user: {
                email: 'ADMIN',
                password: 'pwd'
            },
            token: ''
        }),
        computed: {
            
        },
        apollo: {
            
        },
        watch: {
            token: function() {
                console.log(this.token);
            }
        },
        created() {
        },
        methods: {
            login () {

                this.$apollo.mutate({
                    mutation: gql`
                        mutation ($email: String!, $password: String!) {
                            signin(email: $email, password: $password) {
                                token,
                                user {
                                    name,
                                    email,
                                    password,
                                    role
                                }
                            }
                        }
                    `,
                    variables: { email: this.user.email, password: this.user.password }
                }).then(mutationResult => {
                    const us = {
                        name: mutationResult.data.signin.user.name,
                        email: mutationResult.data.signin.user.email,
                        password: mutationResult.data.signin.user.password,
                        role: mutationResult.data.signin.user.role
                    };
                    const token = mutationResult.data.signin.token;
                    this.$store.dispatch('auth/setUser', {user:us, token: token});
                });

            }
        }
    }
</script>

<style>
    
</style>