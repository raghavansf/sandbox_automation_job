export const SANDBOX_RESOURCE_PROFILES = {
  MEDIUM: 'medium',
  LARGE: 'large',
  XLARGE: 'xlarge',
};
export const SANDBOX_WEBDAV_PERMISSIONS = [
  {
    client_id: 'CLIENTID',
    permissions: [
      { path: '/impex', operations: ['read_write'] },
      { path: '/cartridges', operations: ['read_write'] },
      { path: '/static', operations: ['read_write'] },
    ],
  },
];

export const SANDBOX_OCAPI_SETTINGS = [
  {
    client_id: 'CLIENTID',
    resources: [
      {
        resource_id: '/code_versions',
        methods: ['get'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/code_versions/*',
        methods: ['patch', 'delete'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/jobs/*/executions',
        methods: ['post'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/jobs/*/executions/*',
        methods: ['get'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
      {
        resource_id: '/sites/*/cartridges',
        methods: ['post'],
        read_attributes: '(**)',
        write_attributes: '(**)',
      },
    ],
  },
];

export const SITE_ARCHIVE_PAYLOAD = {
  file_name: '',
  mode: 'merge',
};
