🏗️ Infrastructure – Deployment Architecture on AWS

This document describes the AWS infrastructure designed for deploying a microservices architecture, implemented with Terraform and organized into three independent labs (lab1, lab2, lab3).

The architecture was designed for academic and practical purposes, prioritizing control, traceability, and simplicity, avoiding the use of Auto Scaling Groups and maintaining fixed EC2 instances.

🎯 Infrastructure Objectives

  Provide a modular and reproducible infrastructure using Terraform
  Centralize traffic using an Application Load Balancer
  Run microservices in Docker containers on EC2
  Control deployments using CI/CD without relying on ASG
  Facilitate academic defense of the architecture

🧪 Final Result

  ✔️ 5 fixed EC2 instances
  ✔️ Application Load Balancer as the single entry point
  ✔️ No Auto Scaling Groups
  ✔️ Elastic IPs per instance
  ✔️ Managed PostgreSQL database (RDS)
  ✔️ Redis cache (ElastiCache)
  ✔️ CI/CD controlled by GitHub Actions
  ✔️ Secure deployment via Bastion Host


🧱 General Architecture

Internet
   |
[ Application Load Balancer ]
   |
--------------------------------------------------
|        |        |        |        |            |
EC2-1   EC2-2   EC2-3   EC2-4   EC2-5        (Lab 3)
|        |        |        |        |
Docker   Docker   Docker   Docker   Docker
(2 ms)   (2 ms)   (2 ms)   (2 ms)   (2 ms)
   |
--------------------------------------------------
|         RDS PostgreSQL       |     Redis        |
|            (Lab 2)           |   (Lab 2)        |
--------------------------------------------------


Each EC2 instance runs two Docker microservices, enabling controlled and predictable load distribution.

📁 Project Structure
infra/
├── lab1/ # Baseline Network and Security
├── lab2/ # Shared Services (ALB, RDS, Redis)
├── lab3/ # Compute and Microservices Deployment

🧪 Lab 1 – Network and Security

Responsible for creating the base infrastructure:

Components
  VPC
  Public and Private Subnets
  Internet Gateway
  Route Tables

  Security Groups:

    Bastion Host
    Application Load Balancer
    Application EC2
    PostgreSQL RDS
    Redis

📌 This lab does not deploy services; it only defines the network and the necessary security rules.

🧪 Lab 2 – Shared Services

This lab contains the infrastructure services common to all microservices.

Components

  Application Load Balancer (ALB)

    HTTP Listener (port 80)
    Path-based rules (/api-gateway, /auth-service, etc.)
    Independent Target Groups per microservice
  
  RDS PostgreSQL

    Engine: PostgreSQL 15
    Private access (no public IP)
    Dedicated Subnet Group

  ElastiCache Redis

    Engine: Redis 7
    Used as a cache and lightweight message broker

📌 The Target Groups created here are consumed directly by lab3.

🧪 Lab 3 – Compute and Deployment

This lab deploys the application's main compute.

Components

  5 EC2 instances (Amazon Linux 2)
  Elastic IP per instance
  Docker installed via user_data
  Running 2 containers per instance
  Manual registration with ALB Target Groups

Key Features

  ❌ Auto Scaling Groups are not used
  ✔️ Instances are static and predictable

  ✔️ Each microservice has:

    Fixed port
    Health check defined in the ALB
    Dedicated Target Group

🔐 Bastion Host and Secure Access

  SSH access only via Bastion Host
  Application EC2 instances do not expose public SSH

  GitHub Actions connects using:

    SSH Jump (-J)
    Private key stored in GitHub Secrets

🔄 CI/CD – Deployment Flow

  Push to main or qa

  GitHub Actions:

    Run tests
    Build image Docker
    Publish image to Docker Hub

  SSH connection via Bastion
  Replace container on target EC2
  Health Check verification on the ALB

📌 Deployment is controlled, traceable, and without automatic downtime.

🧠 Architectural Rationale

  This architecture deliberately avoids the use of Auto Scaling Groups to:
  Maintain absolute control of the deployment
  Facilitate debugging and traceability
  Simplify academic defense
  Avoid unnecessary complexity in educational environments

🛠️ Technologies Used

  AWS: EC2, ALB, RDS, ElastiCache, VPC
  Terraform ≥ 1.6
  Docker
  GitHub Actions
  PostgreSQL
  Redis