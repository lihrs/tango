import React, { useState } from 'react';
import { Box } from 'coral-system';
import { Button, Space } from 'antd';
import {
  Designer,
  DesignerPanel,
  SettingPanel,
  Sidebar,
  Toolbar,
  WorkspacePanel,
  WorkspaceView,
  CodeEditor,
  Sandbox,
  DndQuery,
  themeLight,
} from '@music163/tango-designer';
import { createEngine, Workspace } from '@music163/tango-core';
import {
  Logo,
  ProjectDetail,
  bootHelperVariables,
  extendPrototypes,
  sampleFiles,
} from '../helpers';
import {
  ApiOutlined,
  AppstoreAddOutlined,
  BuildOutlined,
  ClusterOutlined,
  FunctionOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';

// 1. 实例化工作区
const workspace = new Workspace({
  entry: '/src/index.js',
  files: sampleFiles,
  prototypes: extendPrototypes,
});

// 2. 引擎初始化
const engine = createEngine({
  workspace,
});

// @ts-ignore
window.__workspace__ = workspace;

// 3. 沙箱初始化
const sandboxQuery = new DndQuery({
  context: 'iframe',
});

// 4. 图标库初始化（物料面板和组件树使用了 iconfont 里的图标）
createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_2891794_cou9i7556tl.js',
});

const menuData = {
  common: [
    {
      title: '基本',
      items: [
        'Button',
        'Section',
        'Columns',
        'Column',
        'Box',
        'Space',
        'Typography',
        'Title',
        'Paragraph',
      ],
    },
    {
      title: '输入',
      items: ['Input', 'InputNumber', 'Select'],
    },
    {
      title: 'Formily表单',
      items: ['FormilyForm', 'FormilyFormItem', 'FormilySubmit', 'FormilyReset'],
    },
  ],
};

/**
 * 5. 平台初始化，访问 https://local.netease.com:6006/
 */
export default function App() {
  const [menuLoading, setMenuLoading] = useState(true);
  // const [menuData, setMenuData] = useState(false);
  return (
    <Designer
      theme={themeLight}
      engine={engine}
      config={{
        customActionVariables: bootHelperVariables,
        customExpressionVariables: bootHelperVariables,
      }}
      sandboxQuery={sandboxQuery}
    >
      <DesignerPanel
        logo={<Logo />}
        description={<ProjectDetail />}
        actions={
          <Box px="l">
            <Toolbar>
              <Toolbar.Item key="routeSwitch" placement="left" />
              <Toolbar.Item key="history" placement="left" />
              <Toolbar.Item key="preview" placement="left" />
              <Toolbar.Item key="modeSwitch" placement="right" />
              <Toolbar.Item key="togglePanel" placement="right" />
              <Toolbar.Separator />
              <Toolbar.Item placement="right">
                <Space>
                  <Button type="primary">发布</Button>
                </Space>
              </Toolbar.Item>
            </Toolbar>
          </Box>
        }
      >
        <Sidebar>
          <Sidebar.Item
            key="components"
            label="组件"
            icon={<AppstoreAddOutlined />}
            widgetProps={{
              menuData,
              loading: menuLoading,
            }}
          />
          <Sidebar.Item key="outline" label="结构" icon={<BuildOutlined />} />
          <Sidebar.Item
            key="variables"
            label="变量"
            icon={<FunctionOutlined />}
            isFloat
            width={800}
          />
          <Sidebar.Item key="dataSource" label="接口" icon={<ApiOutlined />} isFloat width={800} />
          <Sidebar.Item
            key="dependency"
            label="依赖"
            icon={<ClusterOutlined />}
            isFloat
            width={800}
          />
        </Sidebar>
        <WorkspacePanel>
          <WorkspaceView mode="design">
            <Sandbox
              bundlerURL="https://local.netease.com/code"
              onMessage={(e) => {
                if (e.type === 'done') {
                  const sandboxWindow: any = sandboxQuery.window;
                  if (sandboxWindow.TangoAntd) {
                    // if (sandboxWindow.TangoAntd.menuData) {
                    //   setMenuData(sandboxWindow.TangoAntd.menuData);
                    // }
                    if (sandboxWindow.TangoAntd.prototypes) {
                      sandboxWindow.TangoAntd.prototypes['Section'].siblingNames = [
                        'SnippetButtonGroup',
                        'Section',
                        'Section',
                        'Section',
                        'Section',
                        'Section',
                        'Section',
                        'Section',
                      ];
                      sandboxWindow.TangoAntd.prototypes['FormilyFormItem'].siblingNames = [
                        'FormilyFormItem',
                      ];
                      workspace.setComponentPrototypes(sandboxWindow.TangoAntd.prototypes);
                    }
                  }
                  if (sandboxWindow.localTangoComponentPrototypes) {
                    workspace.setComponentPrototypes(sandboxWindow.localTangoComponentPrototypes);
                  }
                  setMenuLoading(false);
                }
              }}
              navigatorExtra={<Button size="small">hello world</Button>}
            />
          </WorkspaceView>
          <WorkspaceView mode="code">
            <CodeEditor />
          </WorkspaceView>
        </WorkspacePanel>
        <SettingPanel />
      </DesignerPanel>
    </Designer>
  );
}
