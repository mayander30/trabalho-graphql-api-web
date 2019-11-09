
<template>
    <div>
        <div class="row">
            <div class="col-md-12" style="text-align:center">
                <Login v-if="!$store.state.auth.token"></Login>
            </div>
            
            <div class="col-md-6" v-if="$store.state.auth.token && $store.state.auth.user.role === 'ADMIN'">
                <Users></Users>
            </div>

            <div class="col-md-6" v-if="$store.state.auth.token">
                <Register v-if="$store.state.auth.token"></Register>
            </div>
        </div>
    </div>
</template>

<script>

    import gql from 'graphql-tag';
    import Users from './Users/Index.vue';
    import Login from './Users/Login.vue';
    import Register from './Register/Index.vue';

    export default {
        data: () => ({
            
        }),
        components: {
            Users,
            Login,
            Register
        },
        apollo: {
            
        },
        created() {
        },
        methods: {
            editUser () {

            }
        }
    }
</script>

<style>
    
</style>