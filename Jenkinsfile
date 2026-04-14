pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "newsverify-app"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
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
                    // Assuming 'env-aayu' is a Secret File credential in Jenkins
                    withCredentials([file(credentialsId: 'env-aayu', variable: 'ENV_FILE')]) {
                        // Use bat for Windows and 'copy' instead of 'cp'
                        bat "copy /Y \"${ENV_FILE}\" .env"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    bat "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Skipping tests as none are defined...'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                }
            }
        }
    }

    post {
        always {
            bat "del /f .env 2>nul || exit 0"
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
