import React from 'react';
import { Box, HTMLCoralProps } from 'coral-system';
import { observer, useDesigner } from '@music163/tango-context';
import { DesignerViewType } from '@music163/tango-core';
import cx from 'classnames';
import { ComponentsPopover, FileErrorsOverlay } from './components';

export interface WorkspaceViewProps extends HTMLCoralProps<'div'> {
  /**
   * 视图面板模式，对应 Workspace 的模式
   */
  mode?: DesignerViewType;
}

export const WorkspaceView = observer((props: WorkspaceViewProps) => {
  const { mode = 'design', children, className, ...rest } = props;
  const designer = useDesigner();
  const display = mode !== designer.activeView ? 'none' : 'block';
  // 移动端模式小屏幕适配，可能会溢出屏幕
  const overflow =
    designer.simulator.name === 'phone' ? 'auto' : designer.isPreview ? 'auto' : 'hidden';
  return (
    <Box
      className={cx('ViewPanel', mode, className)}
      display={designer.activeView === 'dual' ? 'block' : display}
      flex="1"
      overflow={overflow}
      position="relative"
      {...rest}
    >
      {children}
      {/* 添加组件弹层 */}
      {display === 'block' && <ComponentsPopover type="inner" isControlled />}
      {designer.activeView === 'design' && <FileErrorsOverlay />}
    </Box>
  );
});
