pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    stages {
        // stage('Checkout') {
        //     steps {
        //         checkout scm
        //     }
        // }

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

            mail to: 'abdessamadmazighi123@gmail.com',
                 subject: "Pipeline Success: Job '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]",
                 body: "Great news! The pipeline completed successfully.\n\nView the execution details here: ${env.BUILD_URL}"
        }
        // Send your Slack/Email notification here (Lecture 18/21)
        }
        failure {
            echo 'Build failed! Executing authenticated automated rollback...'

            mail to: 'your-personal-email@example.com',
                 subject: "🛑 PIPELINE CRASHED: Job '${env.JOB_NAME}' [Build #${env.BUILD_NUMBER}]",
                 body: "Attention! The pipeline has failed during execution.\n\nReview the console logs to debug the failure here: ${env.BUILD_URL}console"

            // 1. Revert locally
            sh 'git revert HEAD --no-edit'

            // 2. Use Jenkins Credentials helper to safely authenticate the push
            withCredentials([usernamePassword(credentialsId: 'pushing token',
                                          usernameVariable: 'GIT_USER',
                                          passwordVariable: 'GIT_TOKEN')]) {
                // Extract the real branch name locally if env.BRANCH_NAME is null
                sh '''

                # Configure temporary credentials for this specific push command
                git remote set-url origin "https://${GIT_USER}:${GIT_TOKEN}@github.com/amazighii/mr-jenk.git"

                # Push the revert cleanly back up
                git push origin HEAD:main
            '''
                                          }
        }
    }
}
