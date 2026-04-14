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
                        sh "cp ${ENV_FILE} .env"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Test') {
            steps {
                // Add your test commands here, e.g., npm test
                echo 'Skipping tests as none are defined...'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Example deployment step: restart a docker-compose service or container
                    echo "Deploying ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    // sh "docker stop newsverify || true"
                    // sh "docker rm newsverify || true"
                    // sh "docker run -d --name newsverify -p 3000:3000 ${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }
    }

    post {
        always {
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
