export enum MembershipRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  SUSPENDED = 'SUSPENDED',
}

export enum IntegrationProvider {
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  BITBUCKET = 'BITBUCKET',
  JIRA = 'JIRA',
  SLACK = 'SLACK',
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}
