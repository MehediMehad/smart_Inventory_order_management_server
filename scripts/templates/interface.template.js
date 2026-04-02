export default ({ pascal }) => `import type { z } from 'zod';

import type { create${pascal}Schema } from './${pascal.toLowerCase()}.validation';

export type TCreate${pascal}Payload = z.infer<typeof create${pascal}Schema>;
`;
