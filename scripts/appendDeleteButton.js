const TOKEN = "your-token"

const repoInfo =  $('meta[name="twitter:title"]').attr('content').split('/')

const repository = {
  orgUser: repoInfo.shift(),
  name: repoInfo.pop()
}

const REPO = repository.name
const USER_OR_ORG = repository.orgUser

const REPO_URL = `https://api.github.com/repos/${USER_OR_ORG}/${REPO}/deployments`
const AUTH_HEADER = `token ${TOKEN}`

let btn = '<a class="btn btn-danger deploy-delete flex-self-start mt-2 ml-2 mt-md-0" onclick="deleteDeployEnviroment(this)">Delete</a>'
let btnEl =$('div[id^="deployment_environment"]').children('.Box-row').append($(btn))


const makeDeploymentInactive = id =>
  fetch(`${REPO_URL}/${id}/statuses`, {
    method: "POST",
    body: JSON.stringify({ state: "inactive" }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/vnd.github.ant-man-preview+json",
      authorization: AUTH_HEADER
    }
  });

const deleteDeployment = id =>
  fetch(`${REPO_URL}/${id}`, {
    method: "DELETE",
    headers: { authorization: AUTH_HEADER }
  });

const deleteAllDeploymentsByEnviromentName = deployName => {
  fetch(`${REPO_URL}`, { authorization: AUTH_HEADER })
    .then(response => response.json())
    .catch(console.error)
    .then(deploys => {
      let deleteds = 0;
      let toDelete = deploys.filter(deploy => {
        return deploy.environment === deployName;
      });
      toDelete.forEach(deploy => {
        if (deploy.environment !== deployName) return false;
        makeDeploymentInactive(deploy.id)
          .then(() => deleteDeployment(deploy.id).then(() => deleteds++))
          .catch(() => deleteDeployment(deploy.id).then(() => deleteds++))
      });
      if (deleteds === toDelete.length)
        window.location = `https://github.com/${USER_OR_ORG}/${REPO}`;
    });
};

function deleteDeployEnviroment(el) {
  const elBtn = $(el)
  const deployEnviromentName = elBtn.parents().get( 1 ).id.replace('deployment_environment_','')
  elBtn.addClass('disabled')
  deleteAllDeploymentsByEnviromentName(deployEnviromentName)
}
