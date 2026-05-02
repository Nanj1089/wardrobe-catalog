import measurementReference from "@/assets/measurement-reference.png";
import { MEASUREMENT_MAIN_FIELDS, MEASUREMENT_SECONDARY_FIELDS } from "../data/defaultData";
import type { MeasurementData } from "@/types";

interface MeasurementCardProps {
  measurements: MeasurementData;
  updatedAtLabel: string;
  onChange: (key: keyof MeasurementData, value: string) => void;
  onSave: () => void;
}

export function MeasurementCard({ measurements, updatedAtLabel, onChange, onSave }: MeasurementCardProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <article className="measure-card card body-measure-card">
      <div className="measure-card-title">
        <span className="mini-icon">尺</span>
        <strong>我的人体尺寸</strong>
      </div>

      <div className="body-measure-panel">
        <div className="body-measure-figure">
          <img className="body-measure-reference" src={measurementReference} alt="人体尺寸示意图" />
        </div>

        <div className="body-measure-list-wrap">
          <div className="body-measure-list">
            {MEASUREMENT_MAIN_FIELDS.map((field: (typeof MEASUREMENT_MAIN_FIELDS)[number]) => (
              <label key={field.key} className="body-measure-row">
                <span className="body-measure-icon">{field.icon}</span>
                <span className="body-measure-label">{field.label}</span>
                <input
                  className="body-measure-input"
                  type="text"
                  value={measurements[field.key] || ""}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  onBlur={onSave}
                  onKeyDown={handleKeyDown}
                />
                <span className="body-measure-unit">{field.unit}</span>
              </label>
            ))}
          </div>

          <div className="body-measure-meta">
            <span>{updatedAtLabel}</span>
            <button className="ghost-btn body-measure-save" type="button" onClick={onSave}>
              保存尺寸
            </button>
          </div>
        </div>
      </div>

      <div className="body-measure-secondary">
        {MEASUREMENT_SECONDARY_FIELDS.map((field: (typeof MEASUREMENT_SECONDARY_FIELDS)[number]) => (
          <label key={field.key} className="field compact-field">
            <span>{field.label}</span>
            <input
              type="text"
              value={measurements[field.key] || ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              onBlur={onSave}
              onKeyDown={handleKeyDown}
            />
          </label>
        ))}
      </div>
    </article>
  );
}
