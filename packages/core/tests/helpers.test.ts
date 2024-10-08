import { JSXElement } from '@babel/types';
import {
  code2ast,
  code2expression,
  value2node,
  value2code,
  expression2code,
  expressionCode2ast,
  isPathnameMatchRoute,
  namesToImportDeclarations,
  getBlockNameByFilename,
  getRelativePath,
  isFilepath,
  isValidComponentName,
  getFilepath,
  getPrivilegeCode,
  getJSXElementAttributes,
  inferFileType,
  deepCloneNode,
  code2value,
} from '../src/helpers';
import { FileType } from '../src/types';

describe('helpers', () => {
  it('code2ast', () => {
    expect(code2ast('function App() {}').type).toEqual('File');
  });

  it('parse jsxElement attributes', () => {
    const node = code2expression(
      "<Foo id={tango.user.id} num={1} str='col' enumMap={{ 1: '已解决', 2: '未解决' }} list={[{ key: 1 }, { key: 2 }]} />",
    );
    const attributes = getJSXElementAttributes(node as JSXElement);
    expect(attributes).toEqual({
      id: '{{tango.user.id}}',
      num: 1,
      str: 'col',
      enumMap: {
        1: '已解决',
        2: '未解决',
      },
      list: '{{[{ key: 1 }, { key: 2 }]}}',
    });
  });

  it('value2node: number', () => {
    expect(value2node(1).type).toEqual('NumericLiteral');
  });

  it('value2node: string', () => {
    expect(value2node('hello').type).toEqual('StringLiteral');
  });

  it('value2node: arrowFunction', () => {
    const node = value2node(() => {});
    expect(node.type).toEqual('ArrowFunctionExpression');
  });

  it('value2node: object', () => {
    const node = value2node({
      num: 1,
      str: 'string',
      fn: () => {},
      nest: '{this.hello}',
    });
    expect(node.type).toEqual('ObjectExpression');
  });

  it('expression2code: functionExpression', () => {
    expect(expression2code(code2expression('function(){}'))).toEqual('function () {}');
  });

  it('expression2code: arrowFunctionExpression', () => {
    expect(expression2code(code2expression('() => {}'))).toEqual('() => {}');
  });

  it('expression2code: memberExpression', () => {
    expect(expression2code(code2expression('this.foo.bar'))).toEqual('this.foo.bar');
  });

  it('expression2code: identifier', () => {
    expect(expression2code(code2expression('data'))).toEqual('data');
  });

  it('expressionCode2ast', () => {
    expect(expressionCode2ast('<Button>hello</Button>').type).toEqual('File');
    expect(expressionCode2ast('() => <Button>hello</Button>').type).toEqual('File');
  });
});

describe('string helpers', () => {
  it('value2code: empty array', () => {
    expect(value2code([])).toEqual('[]');
    expect(value2code({})).toEqual('{}');
    expect(value2code(() => {})).toEqual('() => {}');
    expect(value2code(true)).toEqual('true');
    expect(value2code(false)).toEqual('false');
    expect(value2code(1)).toEqual('1');
    expect(value2code('hello')).toEqual('"hello"');
    expect(value2code('{{window.tango}}')).toEqual('window.tango');
    expect(value2code('{{() => {}}}')).toEqual('() => {}');
    expect(value2code('{{1111}}')).toEqual('1111');
  });

  it('value2code: array', () => {
    expect(value2code([{ label: 'foo' }])).toEqual('[{ label: "foo" }]');
  });

  it('value2code: object', () => {
    expect(value2code({ width: 200 })).toEqual('{ width: 200 }');
  });

  it('isPathnameMatchRoute', () => {
    expect(isPathnameMatchRoute('/user/123', '/user/:id')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/123?foo=bar', '/user/:id')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/:id', '/user/:id')).toBeTruthy();
    expect(isPathnameMatchRoute('/user', '/user')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/123/modify/123', '/user/:uid/modify/:rid')).toBeTruthy();
    expect(isPathnameMatchRoute('/user/123', '/user')).toBeFalsy();
  });

  it('namesToImportDeclarations', () => {
    expect(
      namesToImportDeclarations(['Button', 'Box', 'React'], {
        Button: { source: '@music163/antd' },
        Box: { source: '@music163/antd' },
        React: { source: 'react', isDefault: true },
      }),
    ).toEqual([
      { sourcePath: '@music163/antd', specifiers: ['Button', 'Box'] },
      { sourcePath: 'react', defaultSpecifier: 'React' },
    ]);
  });

  it('getBlockNameByFilename', () => {
    expect(getBlockNameByFilename('/src/blocks/local-comp/index.js')).toEqual('LocalComp');
  });

  it('getRelativePath', () => {
    expect(getRelativePath('/src/pages/index.js', '/src/blocks/sample-block/index.js')).toEqual(
      '../blocks/sample-block/index.js',
    );
    expect(getRelativePath('/src/pages/index.js', '/src/components')).toEqual('../components');
    expect(getRelativePath('/src/pages/index.js', '/src/components/input.js')).toEqual(
      '../components/input.js',
    );
  });

  it('getFilepath', () => {
    expect(getFilepath('/user', '/src/pages')).toBe('/src/pages/user');
    expect(getFilepath('/user/:id', '/src/pages')).toBe('/src/pages/user@id');
    expect(getFilepath('/user/detail', '/src/pages')).toBe('/src/pages/user-detail');
  });

  it('isFilepath', () => {
    expect(isFilepath('./pages/index.js')).toBeTruthy();
    expect(isFilepath('../pages/index.js')).toBeTruthy();
    expect(isFilepath('./pages/index.css')).toBeTruthy();
    expect(isFilepath('./src/pages/index.js')).toBeTruthy();
    expect(isFilepath('./src/components')).toBeTruthy();
    expect(isFilepath('../src/components')).toBeTruthy();
    expect(isFilepath('path')).toBeFalsy();
    expect(isFilepath('path-browserify')).toBeFalsy();
    expect(isFilepath('@music/one')).toBeFalsy();
  });

  it('getPrivilegeCode', () => {
    expect(getPrivilegeCode('sample-app', '/user')).toBe('sample-app@%user');
    expect(getPrivilegeCode('sample-app', '/user/:id')).toBe('sample-app@%user%:id');
  });

  it('isValidComponentName', () => {
    expect(isValidComponentName('Button')).toBeTruthy();
    expect(isValidComponentName('Button.Group')).toBeTruthy();
    expect(isValidComponentName('div')).toBeTruthy();
    expect(isValidComponentName('')).toBeFalsy();
    expect(isValidComponentName(null)).toBeFalsy();
    expect(isValidComponentName(undefined)).toBeFalsy();
  });

  it('inferFileType', () => {
    expect(inferFileType('/src/pages/template.js')).toBe(FileType.JsViewFile);
    expect(inferFileType('/src/pages/template.jsx')).toBe(FileType.JsViewFile);
    expect(inferFileType('/src/pages/template.ejs')).toBe(FileType.File);
    expect(inferFileType('/src/index.scss')).toBe(FileType.File);
    expect(inferFileType('/src/index.less')).toBe(FileType.File);
    expect(inferFileType('/src/index.json')).toBe(FileType.JsonFile);
  });
});

describe('schema helpers', () => {
  const schema = {
    id: 'Section:1',
    component: 'Section',
    props: {
      id: '111',
    },
    children: [
      {
        id: 'Button:1',
        component: 'Button',
        props: {
          id: '222',
        },
      },
      {
        id: 'Button:2',
        component: 'Button',
        props: {
          id: '333',
        },
      },
    ],
  };
  it('deepCloneNode', () => {
    const cloned = deepCloneNode(schema);
    expect(cloned.props.id).toBe(schema.props.id);
    expect(cloned.children[0].props.id).toBe(schema.children[0].props.id);
    expect(cloned.id).not.toBe(schema.id);
    expect(cloned.children[0].id).not.toBe(schema.children[0].id);
  });
});

describe('code helper', () => {
  it('code2value', () => {
    expect(code2value(`1`)).toEqual(1);
    expect(code2value(`false`)).toEqual(false);
    expect(code2value(`"foo"`)).toEqual('foo');
    expect(code2value(`{ foo: "foo" }`)).toEqual({ foo: 'foo' });
    expect(code2value(`[{ foo: "foo" }]`)).toEqual([{ foo: 'foo' }]);
    expect(code2value(`{ foo: "foo", ...{ bar: "bar"} }`)).toBe(undefined);
    expect(code2value(`() => {}`)).toBe(undefined);
    expect(code2value(`tango.stores.app.name`)).toBe(undefined);
    expect(code2value(`window`)).toBe(undefined);
    expect(code2value(`<div>hello</div>`)).toBe(undefined);
  });
});
