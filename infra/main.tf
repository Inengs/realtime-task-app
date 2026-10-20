terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Lookup for the latest Ubuntu 26.04 AMI (informational only — see output)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-resolute-26.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami                    = "ami-0b6d9d3d33ba97d99" # the actual AMI your instance uses
  instance_type          = "t3.micro"
  key_name               = "taskflow-key"
  subnet_id              = "subnet-0ca12cdd9d4b49878"
  vpc_security_group_ids = ["sg-0103abbe722000667"]

  tags = {
    Name = "taskflow"
  }

  root_block_device {
    volume_size = 16
    volume_type = "gp3"
    iops        = 3000
    throughput  = 125
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    http_protocol_ipv6          = "disabled"
    instance_metadata_tags      = "disabled"
  }

  credit_specification {
    cpu_credits = "unlimited"
  }

  lifecycle {
    # Don't try to replace the instance just because a newer AMI exists
    ignore_changes = [ami]
  }
}

output "ami_id" {
  value       = data.aws_ami.ubuntu.id
  description = "Latest Ubuntu 26.04 AMI available from Canonical"
}

output "instance_id" {
  value = aws_instance.web.id
}

output "instance_public_ip" {
  value = aws_instance.web.public_ip
}