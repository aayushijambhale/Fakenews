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
                    withCredentials([file(credentialsId: 'env-aayu', variable: 'ENV_FILE')]) {
                        // Extract VITE_GOOGLE_CLIENT_ID from the secret file to pass it to the build
                        // We use a temporary batch command to extract the value
                        bat """
                            docker image rm ${DOCKER_IMAGE}:latest || exit 0
                            for /F "tokens=2 delims==" %%i in ('findstr VITE_GOOGLE_CLIENT_ID "${ENV_FILE}"') do set GOOGLE_ID=%%i
                            docker build --build-arg VITE_GOOGLE_CLIENT_ID=%GOOGLE_ID% -t ${DOCKER_IMAGE}:latest .
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying ${DOCKER_IMAGE}:latest..."
                    // Stop and remove existing container if it exists
                    bat "docker stop newsverify || exit 0"
                    bat "docker rm newsverify || exit 0"
                    
                    // Run the new container, passing the .env file fetched from credentials
                    bat "docker run -d --name newsverify -p 3000:3000 --env-file .env ${DOCKER_IMAGE}:latest"
                    
                    echo "Successfully deployed! Access the app at http://localhost:3000"
                }
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
