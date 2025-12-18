/**
 * Material Design theme for Admin module
 * Consistent styling across all admin pages
 */

export const adminTheme = {
  // Layout
  layout: {
    background: "#f5f5f5",
    padding: 24,
    minHeight: "100vh",
  },

  // Card styles
  card: {
    bordered: false,
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    borderRadius: 4,
  },

  // Typography
  typography: {
    pageTitle: {
      level: 3,
      style: {
        margin: 0,
        fontWeight: 500,
      },
    },
    sectionTitle: {
      level: 4,
      style: {
        margin: "0 0 16px 0",
        fontWeight: 500,
      },
    },
    subtitle: {
      type: "secondary" as const,
      style: {
        fontSize: 14,
      },
    },
  },

  // Spacing
  spacing: {
    pageBottom: 24,
    sectionBottom: 24,
    cardGutter: [16, 16] as [number, number],
  },

  // Colors (Material Design inspired)
  colors: {
    primary: "#1976d2",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.6)",
      disabled: "rgba(0, 0, 0, 0.38)",
    },
  },

  // Table styles
  table: {
    size: "middle" as const,
    pagination: {
      defaultPageSize: 10,
      showSizeChanger: true,
      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${total} items`,
    },
  },

  // Button styles
  button: {
    primary: {
      style: {
        borderRadius: 4,
      },
    },
    default: {
      style: {
        borderRadius: 4,
      },
    },
  },
};

/**
 * Helper function to create consistent page header
 */
export const createPageHeader = (title: string, subtitle?: string, extra?: React.ReactNode) => ({
  style: { marginBottom: 24 },
  content: {
    title: {
      level: 3,
      style: { margin: 0, fontWeight: 500 },
      children: title,
    },
    subtitle: subtitle ? {
      type: "secondary" as const,
      style: { fontSize: 14 },
      children: subtitle,
    } : undefined,
    extra,
  },
});

/**
 * Helper function to create stat card
 */
export const createStatCard = (config: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}) => ({
  bordered: false,
  style: { boxShadow: "0 1px 3px rgba(0,0,0,0.12)" },
  content: {
    title: config.title,
    value: config.value,
    subtitle: config.subtitle,
    icon: config.icon,
    color: config.color,
  },
});
