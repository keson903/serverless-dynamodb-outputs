const BbPromise = require("bluebird");
const _ = require("lodash");

class ServerlessDynamoDBOutputs {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.service = serverless.service;
    this.provider = this.serverless.getProvider("aws");

    this.options = options;

    this.hooks = {
      "after:package:compileFunctions": this.addDynamoDBOutputs.bind(this),
    };
  }

  addDynamoDBOutputs() {
    const { Resources: resources } = this.service.resources;

    const tables = Object.entries(resources)
      .map(([key, resource]) =>
        resource.Type === "AWS::DynamoDB::Table" ? key : ""
      )
      .filter((s) => !!s);

    // AWS::DynamoDB::Table

    return BbPromise.each(tables, (tableName) =>
      this.addDynamoDBOutput(tableName)
    );
  }

  addDynamoDBOutput(tableName) {
    // Add RAW function Arn/Name to Outputs section
    const functionArnOutputLogicalId = `${tableName}Arn`;
    const tableNameOutputLogicalId = `${tableName}Name`;

    const functionArnOutput = this.cfOutputDynamoDBArnTemplate();
    const tableNameOutput = this.cfOutputDynamoDBNameTemplate();

    functionArnOutput.Value = {
      "Fn::GetAtt": [tableName, "Arn"],
    };
    tableNameOutput.Value = { Ref: tableName };

    _.merge(
      this.serverless.service.provider.compiledCloudFormationTemplate.Outputs,
      {
        [functionArnOutputLogicalId]: functionArnOutput,
        [tableNameOutputLogicalId]: tableNameOutput,
      }
    );
  }

  cfOutputDynamoDBArnTemplate() {
    return {
      Description: "Current DynamoDB Arn",
      Value: "Value",
    };
  }

  cfOutputDynamoDBNameTemplate() {
    return {
      Description: "Current DynamoDB Name",
      Value: "Value",
    };
  }
}

module.exports = ServerlessDynamoDBOutputs;
