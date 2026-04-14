pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "newsverify-app"
        // Add Docker to Path and set Docker Host for Windows
        PATH = "C:\\Program Files\\Docker\\Docker\\resources\\bin;${env.PATH}"
        DOCKER_HOST = "tcp://127.0.0.1:2375"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    // Fetching the 'env-aayu' Secret File from Jenkins Credentials
                    withCredentials([file(credentialsId: 'env-aayu', variable: 'ENV_FILE')]) {
                        bat "copy /Y \"${ENV_FILE}\" .env"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Clear the previous image to ensure a fresh build
                    bat "docker image rm ${DOCKER_IMAGE}:latest || exit 0"
                    bat "docker build -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deployment stage: Image ${DOCKER_IMAGE}:latest is ready."
            }
        }
    }

    post {
        always {
            // Clean up the temporary .env file and dangling docker images
            bat "del /f .env 2>nul || exit 0"
            bat "docker image prune -f || exit 0"
            cleanWs()
        }
        success {
            echo 'Build and Deployment successful!'
        }
        failure {
            echo 'Build failed. Checking logs...'
        }
    }
}
