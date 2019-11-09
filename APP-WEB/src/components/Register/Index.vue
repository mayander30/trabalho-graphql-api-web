
<template>
    <div>
        <h1>Registros de Ponto</h1>
        <button class="btn btn-success btn-lg" @click="register">Registrar o Ponto</button>
        <div class="row">
            <div class="col-md-6">
                <table class="table">
                    <thead class="thead-dark">
                        <th>Usuario</th>
                        <th>Data/Hora</th>
                    </thead>
                    <tbody>
                        <tr v-for="user in allRegistered_Times" :key="user.id">
                            <td>{{ user.user.email }}</td>
                            <td>{{ user.time_registered }}</td>
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
            allRegistered_Times: []
        }),
        computed: {
            
        },
        apollo: {
            allRegistered_Times: gql`{
                allRegistered_Times {
                    id,
                    time_registered,
                    user {
                        id,
                        name,
                        email
                    }
                }
            }`
        },
        created() {
        },
        methods: {
            register () {   
                let register = {
                    time_registered: new Date(),
                    user: this.$store.state.auth.user
                };

                this.$apollo.mutate({
                    mutation: gql`
                        mutation ($data: CreateRegistered_TimeInput) {
                            createRegistered_Time(data: $data) {
                                id,
                                user {
                                    id,
                                    name
                                }
                            }
                        }
                    `,
                    variables: { data: register }
                }).then(mutationResult => {
                    this.allRegistered_Times = [register, ...this.allRegistered_Times];
                });
            }
        }
    }
</script>

<style>
    
</style>