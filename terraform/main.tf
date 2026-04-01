# 1. Tell Terraform we are using AWS
provider "aws" {
  region = "us-east-1"
}

# 2. Automatically find the latest Free Ubuntu OS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 3. Create a Firewall (Security Group) to let traffic in
resource "aws_security_group" "sonicnode_sg" {
  name        = "sonicnode_sg_v2"
  description = "Allow SSH and App traffic"

  # Allow SSH to log in (Port 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Frontend and Backend traffic (Ports 3000, 3001, 3002)
  ingress {
    from_port   = 3000
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow the server to download things from the internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Order the server and attach the firewall
resource "aws_instance" "sonicnode_server" {
  ami             = data.aws_ami.ubuntu.id
  instance_type   = "t3.micro"
  security_groups = [aws_security_group.sonicnode_sg.name]
  key_name        = aws_key_pair.sonicnode_key.key_name
  tags = {
    Name = "SonicNode-Production-Server"
  }
}

# 5. Print the server's public IP address so we can see it!
output "server_public_ip" {
  value = aws_instance.sonicnode_server.public_ip
}

# Create the SSH Lock for the server
resource "aws_key_pair" "sonicnode_key" {
  key_name   = "sonicnode-deploy-key-v2"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDSXucTyNLyj88xX/FRRV+vWhoe42mO/qauXSWSW0X/Cu5b+xDCyqT6EeTdw57R7jpTGfF/3WA0JNoGWDWD31AxO7Nf5kgt5w111ScASSDZ4UrlQGOs7tcsSV2fPWLh5/4EFYAP0+2LiFeLqP0qaaMoAFtWCGTgIOKujcACVCyZ35h0XZejLG8sGLwM8k4sE1OXz8UakKjuW/ActEDaA/EA2lHsBBA+AuFGsDDmGneSLezD+faJ2s3BClVJJVmxKNCP/wTrIAM+90vkXnMTk2mOlLMVG3J5ay4MJKCUcToGMuOCNt0CxoY/3ipIQgj++L2aq16wskPrLkMRpJMWjYk9 user@Elhanan" 
}