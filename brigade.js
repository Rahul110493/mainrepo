const { events, Job } = require("brigadier");


events.on("push", function(e, project) {
  console.log("received push for commit " + e.revision.commit)

  var deploy = new Job("docker-deploy")

  deploy.image = "microsoft/azure-cli:latest"

  deploy.env.SERVICE_USER = project.secrets.serviceuser 
  deploy.env.SERVICE_PASS = project.secrets.servicepass
  deploy.env.SERVICETENANT = project.secrets.servicetenant
  deploy.env.GCR_REPONAME = project.secrets.mygcr
  deploy.env.GCR_IMAGE = project.secrets.gcrimage


  deploy.tasks = [ 
  "curl -L https://dl.k8s.io/v1.10.6/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl",
  "sleep 90",
  "cd /usr/local/bin",
  "chmod -R 775 kubectl",
  "az login --service-principal -u $SERVICE_USER -p $SERVICE_PASS --tenant $SERVICETENANT",
  "az aks get-credentials --resource-group Myk8s --name Myk8s",
  "kubectl set image deployment/nginx nginx=$GCR_REPONAME/$GCR_IMAGE:latest"
  ]

  deploy.run()
  })  


