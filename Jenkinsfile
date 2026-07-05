pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Unit Tests') {
            steps {
                // Compile and test your Spring Boot microservices
                sh './mvnw clean test'
            }
            // post {
            //     always {
            //         junit '**/target/surefire-reports/*.xml'
            //     }
            // }
        }

        // stage('Frontend Unit Tests') {
        //     steps {
        //         // Headless Angular execution (e.g., Jasmine/Karma)
        //         dir('frontend') {
        //             sh 'npm install'
        //             sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
        //         }
        //     }
        // }

        stage('Build & Package') {
            steps {
                // Package the artifacts into JARs skipping tests (since they just passed)
                sh './mvnw package -DskipTests'
            }
        }

        stage('Deploy Stack') {
            steps {
                echo "Deploying the Microservices Platform..."
                // Execute a headless docker compose up command
                // Note: We bypass certificate generation on the CI engine by supplying pre-existing configurations
                sh 'docker network inspect shared-net >/dev/null 2>&1 || docker network create shared-net'
                sh 'docker compose down'
                sh 'docker compose up --build -d'
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
            // Send your Slack/Email notification here (Lecture 18/21)
        }
        failure {
            echo "Pipeline failed. Initiating Rollback..."
            // Rollback strategy: Shut down corrupted stacks
            sh 'docker compose down'
            // Option: sh 'docker compose -f docker-compose.rollback.yml up -d'
        }
    }
}
