pipeline {

    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timeout(time: 30, unit: 'MINUTES')
    }

    parameters {
        booleanParam(name: 'DOCKER_PUSH', defaultValue: true, description: 'Push Docker Images')
        booleanParam(name: 'BUILD_ML', defaultValue: true, description: 'Build ML Service')
        booleanParam(name: 'BUILD_BACKEND', defaultValue: true, description: 'Build Backend Service')
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: true, description: 'Build Frontend Service')
    }

    environment {

        DOCKER_USERNAME = 'sudharsanprakalathanvm'
        DOCKER_CREDENTIALS_ID = 'dockerhub-creds'

        ML_IMAGE = 'factorypulse-ml'
        BACKEND_IMAGE = 'factorypulse-backend'
        FRONTEND_IMAGE = 'factorypulse-frontend'

    }

    stages {

        stage('Verify Docker') {
            steps {
                bat 'docker version'
                bat 'docker ps'
            }
        }

stage('Docker Hub Login') {

    when {
        expression { params.DOCKER_PUSH }
    }

    steps {

        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {

            bat '''
            docker logout
            echo|set /p="%DOCKER_PASS%" | docker login -u "%DOCKER_USER%" --password-stdin
            '''

        }

    }

}

        stage('Build ML Image') {

            when {
                expression { params.BUILD_ML }
            }

            steps {

                dir('ml') {

                    bat """
                    docker build ^
                    -t ${DOCKER_USERNAME}/${ML_IMAGE}:latest ^
                    -t ${DOCKER_USERNAME}/${ML_IMAGE}:${BUILD_NUMBER} .
                    """

                }

            }

        }

        stage('Push ML Image') {

            when {
                allOf {
                    expression { params.BUILD_ML }
                    expression { params.DOCKER_PUSH }
                }
            }

            steps {

                bat """
                docker push ${DOCKER_USERNAME}/${ML_IMAGE}:latest
                docker push ${DOCKER_USERNAME}/${ML_IMAGE}:${BUILD_NUMBER}
                """

            }

        }

        stage('Build Backend Image') {

            when {
                expression { params.BUILD_BACKEND }
            }

            steps {

                dir('backend') {

                    bat """
                    docker build ^
                    -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest ^
                    -t ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER} .
                    """

                }

            }

        }

        stage('Push Backend Image') {

            when {
                allOf {
                    expression { params.BUILD_BACKEND }
                    expression { params.DOCKER_PUSH }
                }
            }

            steps {

                bat """
                docker push ${DOCKER_USERNAME}/${BACKEND_IMAGE}:latest
                docker push ${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER}
                """

            }

        }

        stage('Build Frontend Image') {

            when {
                expression { params.BUILD_FRONTEND }
            }

            steps {

                dir('frontend') {

                    bat """
                    docker build ^
                    -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest ^
                    -t ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                    """

                }

            }

        }

        stage('Push Frontend Image') {

            when {
                allOf {
                    expression { params.BUILD_FRONTEND }
                    expression { params.DOCKER_PUSH }
                }
            }

            steps {

                bat """
                docker push ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:latest
                docker push ${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER}
                """

            }

        }


stage('Deploy to Kubernetes') {

    when {
        expression { params.DOCKER_PUSH }
    }

    steps {

        echo "==========================================="
        echo "Deploying Build ${BUILD_NUMBER} to Kubernetes"
        echo "==========================================="

        // Safe Kubernetes resources
        bat '''
        kubectl apply -f kubernetes/namespace.yaml
        kubectl apply -f kubernetes/configmap.yaml
        kubectl apply -f kubernetes/backend-service.yaml
        kubectl apply -f kubernetes/ml-service.yaml
        kubectl apply -f kubernetes/frontend-service.yaml
        kubectl apply -f kubernetes/backend-deployment.yaml
        kubectl apply -f kubernetes/ml-deployment.yaml
        kubectl apply -f kubernetes/frontend-deployment.yaml
        '''

        // Update images to current build
        bat """
        kubectl set image deployment/backend ^
        backend=${DOCKER_USERNAME}/${BACKEND_IMAGE}:${BUILD_NUMBER} ^
        -n factorypulse
        """

        bat """
        kubectl set image deployment/ml ^
        ml=${DOCKER_USERNAME}/${ML_IMAGE}:${BUILD_NUMBER} ^
        -n factorypulse
        """

        bat """
        kubectl set image deployment/frontend ^
        frontend=${DOCKER_USERNAME}/${FRONTEND_IMAGE}:${BUILD_NUMBER} ^
        -n factorypulse
        """

        // Wait for rollout
        bat '''
        kubectl rollout status deployment/backend -n factorypulse
        '''

        bat '''
        kubectl rollout status deployment/ml -n factorypulse
        '''

        bat '''
        kubectl rollout status deployment/frontend -n factorypulse
        '''

        // Deployment summary
        bat '''
        kubectl get deployments -n factorypulse
        '''

        bat '''
        kubectl get pods -n factorypulse
        '''

        echo "==========================================="
        echo "Deployment Successful"
        echo "==========================================="

    }

}

        stage('Docker Cleanup') {

            steps {

                bat 'docker image prune -f'

            }

        }

        stage('Docker Logout') {

            when {
                expression { params.DOCKER_PUSH }
            }

            steps {

                bat 'docker logout'

            }

        }
    }

    post {

        success {

            echo '==========================================='
            echo 'Factory Pulse Pipeline Completed Successfully'
            echo "Build Number : ${BUILD_NUMBER}"
            echo '==========================================='

        }

        failure {

            echo '==========================================='
            echo 'Factory Pulse Pipeline Failed'
            echo "Build Number : ${BUILD_NUMBER}"
            echo '==========================================='

        }

        always {

            cleanWs()

        }

    }

}