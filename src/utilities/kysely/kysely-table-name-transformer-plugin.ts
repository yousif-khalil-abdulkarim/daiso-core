/**
 * @module Utilities
 */

import type {
    KyselyPlugin,
    PluginTransformQueryArgs,
    PluginTransformResultArgs,
    QueryResult,
    RootOperationNode,
    UnknownRow,
    TableNode,
} from "kysely";
import { OperationNodeTransformer } from "kysely";

/**
 * @internal
 */
class TableNameTransformer extends OperationNodeTransformer {
    constructor(private readonly tableNameMap: Record<string, string>) {
        super();
    }

    protected override transformTable(node: TableNode): TableNode {
        const transformedNode = super.transformTable(node);
        return {
            ...transformedNode,
            table: {
                ...transformedNode.table,
                identifier: {
                    ...transformedNode.table.identifier,
                    name: (() => {
                        const sqlTableName =
                            transformedNode.table.identifier.name;
                        const mapedTableName = this.tableNameMap[sqlTableName];
                        if (mapedTableName === undefined) {
                            throw new Error(
                                `Table does not exist "${sqlTableName}"`,
                            );
                        }
                        return mapedTableName;
                    })(),
                },
            },
        };
    }
}

/**
 * @internal
 */
export class KyselyTableNameTransformerPlugin implements KyselyPlugin {
    private readonly transformer: TableNameTransformer;

    constructor(tableNameMap: Record<string, string>) {
        this.transformer = new TableNameTransformer(tableNameMap);
    }

    transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
        return this.transformer.transformNode(args.node);
    }

    transformResult(
        args: PluginTransformResultArgs,
    ): Promise<QueryResult<UnknownRow>> {
        return Promise.resolve(args.result);
    }
}
