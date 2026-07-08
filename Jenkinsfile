pipeline {
    agent any

    triggers {
        pollSCM('H/* * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Unit Tests') {
            steps {
                sh './mvnw clean test'
            }
        // post {
        //     always {
        //         junit '**/target/surefire-reports/*.xml'
        //     }
        // }
        }

        stage('Frontend Unit Tests') {
            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run test -- --watch=false'
                }
            }
        }

        stage('Build & Package') {
            steps {
                sh './mvnw package -DskipTests'
            }
        }

        stage('Deploy Stack') {
            steps {
                echo 'Deploying the Microservices Platform...'
                // Note: We bypass certificate generation on the CI engine by supplying pre-existing configurations
                sh 'docker network inspect shared-net >/dev/null 2>&1 || docker network create shared-net'
                sh 'docker compose down'
                sh 'docker compose up --build -d'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        // Send your Slack/Email notification here (Lecture 18/21)
        }
        failure {
            echo 'Pipeline failed. Initiating Rollback...'

            sh 'docker compose down'
            sh 'git revert HEAD --no-edit'
        // Option: sh 'docker compose -f docker-compose.rollback.yml up -d'
        }
    }
}
