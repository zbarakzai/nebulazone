module.exports = function (api) {
  const envName = api.env();
  const development = envName === 'development' || envName === 'test';
  return {
    presets: [
      [
        '@babel/preset-env',
        {useBuiltIns: 'entry', corejs: '3.0', bugfixes: true},
      ],
      ['@babel/preset-typescript'],
      ['@babel/preset-react', {development, useBuiltIns: true}],
    ],
    babelrcRoots: ['.'],
  };
};
