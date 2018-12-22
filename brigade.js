const { events, Job } = require("brigadier");


events.on("push", function(e, project) {
  console.log("received push for commit " + e.revision.commit)

  // Create a new job
  var dockerBuild = new Job("docker-build")

  dockerBuild.image = "docker:dind"
  dockerBuild.privileged = true;

  dockerBuild.env = {
    DOCKER_DRIVER: "overlay"
  }

  dockerBuild.env.DOCKER_USER = project.secrets.dockerLogin 
  dockerBuild.env.DOCKER_PASS = project.secrets.dockerPass
  dockerBuild.env.GCR_REPONAME = project.secrets.mygcr
  dockerBuild.env.GCR_IMAGE = project.secrets.gcrimage

  dockerBuild.tasks = [
    "dockerd-entrypoint.sh &", // Start the docker daemon
    "sleep 20", // Grant it enough time to be up and running
    "cd /src/", // Go to the project checkout dir
    "docker build -t $GCR_REPONAME/$GCR_IMAGE:latest .", // Replace with your own image tag
    "docker login $GCR_REPONAME -u $DOCKER_USER -p $DOCKER_PASS",
    "docker push $GCR_REPONAME/$GCR_IMAGE:latest" // Replace with your own image tag
  ]
  
  dockerBuild.run()
  
 // Create a new job

  })  


