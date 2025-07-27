# 🧠 Full Local Dev Setup: Docker + Kubernetes (Minikube) + Helm + ArgoCD

This guide walks you through setting up a full GitOps-based local Kubernetes environment using Docker, Helm, Minikube, and ArgoCD.

---

## ✅ Prerequisites

- Docker installed
- `kubectl` CLI
- `minikube` installed
- `helm` CLI installed
- `argocd` CLI (optional but helpful)
- GitHub repository with a valid Helm chart (e.g. `values.yaml`, `templates/`, `Chart.yaml`)

---

## 🚀 Step-by-Step Setup

### 1. **Start Minikube**

```bash
minikube start
```

### 2. **Use Minikube’s Docker Daemon**

```bash
eval $(minikube docker-env)
```

### 3. **Build Your Image**

```bash
docker build -t my-kube-app:v1 .
```

### 4. **Create a Helm Chart**

If not already done:

```bash
helm create my-kube-chart
```

Customize:

- `values.yaml`
- `deployment.yaml`, `service.yaml`, etc in `templates/`

Set image info in `values.yaml`:

```yaml
image:
  repository: my-kube-app
  tag: v1
  pullPolicy: IfNotPresent
```

### 5. **Install Helm Chart Locally (optional test)**

```bash
helm install my-kube-chart ./my-kube-chart
```

### 6. **Expose the App via NodePort**

```bash
kubectl expose deployment my-app-my-kube-chart --type=NodePort --port=3000
minikube service list
```

Use the `NodePort` in your browser.

---

### 7. **Install ArgoCD**

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Port forward ArgoCD UI:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open [https://localhost:8080](https://localhost:8080)

Login:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

Username: `admin`

---

### 8. **Create ArgoCD Application**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-kube-chart
  namespace: argocd
spec:
  destination:
    namespace: default
    server: https://kubernetes.default.svc
  source:
    repoURL: https://github.com/your-username/my-kube-chart
    path: .
    targetRevision: main
  project: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Apply it:

```bash
kubectl apply -f app.yaml
```

---

### 9. **Test New Image (v2+)**

```bash
eval $(minikube docker-env)
docker build -t my-kube-app:v2 .

# Update tag in values.yaml in GitHub repo
# Commit and push

# ArgoCD will detect the change, pull and deploy v2
```

---

## 📖 Key Concepts & Terminology

| Term             | Explanation                                       |
| ---------------- | ------------------------------------------------- |
| **Docker Image** | Packaged application environment                  |
| **Container**    | Running instance of a Docker image                |
| **Minikube**     | Lightweight Kubernetes cluster on your machine    |
| **Helm**         | Package manager for Kubernetes (like apt or npm)  |
| **Chart**        | Helm package: includes templates and values       |
| **ArgoCD**       | GitOps controller: syncs Kubernetes from Git      |
| **Deployment**   | Describes desired state: pods, replicas, image    |
| **ReplicaSet**   | Ensures N pods are always running                 |
| **Pod**          | Basic Kubernetes runtime unit, wraps containers   |
| **NodePort**     | Exposes a service to be accessible on a node's IP |
| **Service**      | Abstraction to expose pods                        |
| **Namespace**    | Virtual cluster inside Kubernetes cluster         |
| **Prune**        | ArgoCD removes resources not defined in Git       |
| **Self-heal**    | ArgoCD restores cluster to Git-defined state      |

---

✅ You now have a Git-driven, production-like environment running entirely locally!
